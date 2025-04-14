import numpy as np
import time, json, cv2
import logging, requests
import torch
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = YOLO("segmentation-model.pt")
model.to(device)

MODEL_SIZE = (640, 640)

# At the module level
with open("categories.json", "r") as f:
    _CATEGORY_MAP = {item["id"]: item["name"] for item in json.load(f)["categories"]}

def map_to_category_label(id):
    return _CATEGORY_MAP.get(id, str(id))

def detect_dominant_color(image):
    # Reshape the image to a list of pixels
    pixels = image.reshape((-1, 3))

    # Compute the average color
    avg_color = np.mean(pixels, axis=0).astype(int)

    # Prepare the JSON output
    color_data = {
        "red": int(avg_color[2]),
        "green": int(avg_color[1]),
        "blue": int(avg_color[0]),
    }

    return color_data

def get_image(image_path):
    image_url = f"https://cdn.dripdropco.com/{image_path}?format=jpeg"

            # Fetch the Base64 content directly
    response = requests.get(image_url)
    response.raise_for_status()  # Ensure the request was successful
    
    return response.content
        
def output_fn(prediction_output):
    print("Executing output_fn from inference...")
    infer = {}
    for result in prediction_output:
        if 'boxes' in result._keys and result.boxes is not None:
            infer['boxes'] = result.boxes.cpu().numpy().data.tolist()
        if 'masks' in result._keys and result.masks is not None:
            infer['masks'] = result.masks.cpu().numpy().data.tolist()
        if 'keypoints' in result._keys and result.keypoints is not None:
            infer['keypoints'] = result.keypoints.cpu().numpy().data.tolist()
        if 'probs' in result._keys and result.probs is not None:
            # Extract top-5 class indices and their confidence scores
            top5_indices = result.probs.top5
            top5_scores = result.probs.top5conf.tolist()
            # Store in the output dictionary
            infer['probs'] = {
                "top5_indices": top5_indices,
                "top5_scores": top5_scores
            }

    return infer


def segment_image(image_path):
    """Runs segmentation on the input image and returns detected objects."""
    infer_start_time = time.time()
    
    logger.info("Fetching image")
    image = get_image(image_path)
    logger.info("Image fetched")

    # Convert the response content into a NumPy array
    image_array = np.frombuffer(image, dtype=np.uint8)

    # Decode the image array into an OpenCV image
    orig_image = cv2.imdecode(image_array, flags=-1)
    # orig_image = cv2.imread('outfit.jpg')

    # Calculate the parameters for image resizing
    model_height, model_width = 640, 640

    # Resize the image as numpy array
    resized_image = cv2.resize(orig_image, MODEL_SIZE)


    with torch.no_grad():
        logger.info("Running Inference")
        result = model(resized_image)
    
    detection_results = output_fn(result)

    infer_end_time = time.time()

    logger.info(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")

    # Retrieve detection outputs
    boxes = detection_results.get("boxes", [])
    masks = detection_results.get("masks", None)

    # Get image dimensions

    items = []

    for i, box in enumerate(boxes):
        # Extract bounding box details
        xmin, ymin, xmax, ymax = map(int, box[:4])
        conf = round(box[4], 2)
        cls_id = int(box[5])
        
        # Crop the detected region
        cropped_img = orig_image[ymin:ymax, xmin:xmax]
        dominant_color = detect_dominant_color(cropped_img)  # Custom function

        # Apply segmentation mask if available
        if masks is not None:
            mask = np.array(masks[i])
            mask_resized = cv2.resize(mask, (xmax - xmin, ymax - ymin))
            _, mask_binary = cv2.threshold(mask_resized, 0.5, 1, cv2.THRESH_BINARY)
            cropped_img = cv2.bitwise_and(
                cropped_img, cropped_img, mask=mask_binary.astype(np.uint8)
            )

            # Normalize box coordinates relative to the original image size
            resized_h, resized_w = resized_image.shape[:2]
            norm_xmin = xmin / resized_w
            norm_ymin = ymin / resized_h
            norm_xmax = xmax / resized_w
            norm_ymax = ymax / resized_h

        item = {
            "item": map_to_category_label(cls_id),  # Custom function
            "confidence": conf,
            "color": dominant_color,
            "coordinates": {
                "xmin": norm_xmin,
                "ymin": norm_ymin,
                "xmax": norm_xmax,
                "ymax": norm_ymax,
            },
            "cropped_image": cropped_img.tolist(),  # Convert NumPy array to list
        }
        items.append(item)

    return {"clothing_items": items}