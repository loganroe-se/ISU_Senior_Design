import numpy as np
import time, json, cv2
import logging, requests
import torch
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model once at import time
model = YOLO("segmentation-model.pt").to(device)
MODEL_SIZE = (640, 640)

# Load category map at import time
with open("categories.json", "r") as f:
    _CATEGORY_MAP = {item["id"]: item["name"] for item in json.load(f)["categories"]}


def map_to_category_label(id):
    return _CATEGORY_MAP.get(id, str(id))


def detect_dominant_color(image):
    pixels = image.reshape((-1, 3))
    if pixels.size == 0:
        return {"red": 0, "green": 0, "blue": 0, "error": "Empty image"}
    avg_color = np.mean(pixels, axis=0)
    if np.isnan(avg_color).any():
        return {"red": 0, "green": 0, "blue": 0, "error": "NaN encountered"}
    return {
        "red": int(avg_color[2]),
        "green": int(avg_color[1]),
        "blue": int(avg_color[0]),
    }


def get_image(image_path):
    url = f"https://cdn.dripdropco.com/{image_path}?format=jpeg"
    response = requests.get(url)
    response.raise_for_status()
    return response.content


def output_fn(prediction_output):
    print("Executing output_fn from inference...")
    infer = {}
    for result in prediction_output:
        if "boxes" in result._keys and result.boxes is not None:
            boxes_tensor = torch.cat([
                result.boxes.xyxy,
                result.boxes.conf.unsqueeze(1),
                result.boxes.cls.unsqueeze(1)
            ], dim=1)
            infer["boxes"] = boxes_tensor.cpu().numpy().tolist()

        if "masks" in result._keys and result.masks is not None:
            # Extract tensor from Masks object
            masks_tensor = result.masks.data  # This is a tensor
            infer["masks"] = masks_tensor.cpu().numpy().tolist()

        if "keypoints" in result._keys and result.keypoints is not None:
            infer["keypoints"] = result.keypoints.cpu().numpy().tolist()

        if "probs" in result._keys and result.probs is not None:
            infer["probs"] = {
                "top5_indices": result.probs.top5,
                "top5_scores": result.probs.top5conf.tolist(),
            }

    return infer

def segment_image(image_path):
    infer_start_time = time.time()
    logger.info("Fetching image")
    image = get_image(image_path)
    logger.info("Image fetched")

    # Decode to OpenCV image
    image_array = np.frombuffer(image, dtype=np.uint8)
    orig_image = cv2.imdecode(image_array, flags=-1)
    if orig_image is None:
        logger.error("Failed to decode image.")
        return {"error": "Invalid image data"}

    resized_image = cv2.resize(orig_image, MODEL_SIZE)

    with torch.no_grad():
        logger.info("Running inference")
        result = model(resized_image)

    detection_results = output_fn(result)
    infer_end_time = time.time()
    logger.info(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")

    boxes = detection_results.get("boxes", [])
    masks = detection_results.get("masks", None)
    items = []

    for i, box in enumerate(boxes):
        try:
            xmin, ymin, xmax, ymax = map(int, box[:4])
            conf = round(box[4], 2)
            cls_id = int(box[5])

            #Skip detections with low confidence
            if conf < 0.2:
                logger.info(f"Skipping detection #{i} with low confidence {conf}")
                continue

            # Safety check
            if xmax <= xmin or ymax <= ymin:
                logger.warning("Invalid bounding box coordinates, skipping.")
                continue

            cropped_img = orig_image[ymin:ymax, xmin:xmax]
            if cropped_img.size == 0:
                logger.warning("Empty crop encountered, skipping.")
                continue

            dominant_color = detect_dominant_color(cropped_img)

            # Segmentation mask logic
            if masks is not None and i < len(masks):
                mask = np.array(masks[i])
                mask_resized = cv2.resize(mask, (xmax - xmin, ymax - ymin))

                if mask_resized.size == 0:
                    logger.warning("Empty mask encountered, skipping mask.")
                else:
                    _, mask_binary = cv2.threshold(mask_resized, 0.5, 1, cv2.THRESH_BINARY)
                    if mask_binary.shape[:2] != cropped_img.shape[:2]:
                        mask_binary = cv2.resize(mask_binary, (cropped_img.shape[1], cropped_img.shape[0]))
                    try:
                        cropped_img = cv2.bitwise_and(
                            cropped_img, cropped_img, mask=mask_binary.astype(np.uint8)
                        )
                    except cv2.error as e:
                        logger.error(f"OpenCV error applying mask: {e}")
                        continue

            resized_h, resized_w = resized_image.shape[:2]
            item = {
                "item": map_to_category_label(cls_id),
                "confidence": conf,
                "color": dominant_color,
                "coordinates": {
                    "xmin": xmin / resized_w,
                    "ymin": ymin / resized_h,
                    "xmax": xmax / resized_w,
                    "ymax": ymax / resized_h,
                },
                "cropped_image": cropped_img.tolist(),
            }
            items.append(item)

        except Exception as e:
            logger.exception(f"Error processing detection #{i}: {e}")


    return {"clothing_items": items}
