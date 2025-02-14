import numpy as np
import time
import json
import cv2
import boto3
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sm_client = boto3.client(service_name="sagemaker")

# Restore the endpoint name stored in the 2_DeployEndpoint.ipynb notebook
ENDPOINT_NAME = "yolov11-segmentation-model-2025-02-14-01-23-44-327340"
logger.info(f"Endpoint Name: {ENDPOINT_NAME}")


def check_endpoint():
    endpoint_created = False
    while True:
        response = sm_client.list_endpoints()
        for ep in response["Endpoints"]:
            logger.info(f"Endpoint Status = {ep['EndpointStatus']}")
            if (
                ep["EndpointName"] == ENDPOINT_NAME
                and ep["EndpointStatus"] == "InService"
            ):
                endpoint_created = True
                break
        if endpoint_created:
            break
        time.sleep(5)


def map_to_category_label(id):
    categories_file = f"json/categories.json"

    with open(categories_file, "r") as f:
        categories_f = json.load(f)

    # Create train/val directories for each attribute
    categories = {}

    for item in categories_f["categories"]:
        categories_id = item["id"]
        categories_name = item["name"]
        categories[categories_id] = categories_name

    return categories.get(id, id)


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


def segment_image(image_path):
    """Runs segmentation on the input image and returns detected objects."""
    check_endpoint()

    infer_start_time = time.time()

    runtime = boto3.client("runtime.sagemaker")
    response = runtime.invoke_endpoint(
        EndpointName=ENDPOINT_NAME, ContentType="text/csv", Body=image_path
    )
    response_body = response["Body"].read()
    detection_results = json.loads(response_body.decode("ascii"))

    infer_end_time = time.time()

    items = []

    logger.info(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")

    for result in detection_results:
        boxes = result.boxes
        masks = result.masks
        img = cv2.imread(image_path)

        for i, box in enumerate(boxes):
            xmin, ymin, xmax, ymax = map(int, box.xyxy[0])
            conf = round(box.conf[0].item(), 2)
            cls_id = box.cls[0].item()
            cropped_img = img[ymin:ymax, xmin:xmax]
            dominant_color = detect_dominant_color(cropped_img)

            # Apply segmentation mask if available
            if masks is not None:
                mask = np.array(masks.data[i].cpu().numpy())
                mask_resized = cv2.resize(mask, (xmax - xmin, ymax - ymin))
                _, mask_binary = cv2.threshold(mask_resized, 0.5, 1, cv2.THRESH_BINARY)
                cropped_img = cv2.bitwise_and(
                    cropped_img, cropped_img, mask=mask_binary.astype(np.uint8)
                )

            item = {
                "item": map_to_category_label(cls_id),
                "confidence": conf,
                "color": dominant_color,
                "coordinates": {"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax},
                "cropped_image": cropped_img.tolist(),  # Convert NumPy array to list
            }
            items.append(item)

    return {"clothing_items": items}
