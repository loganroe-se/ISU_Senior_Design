import numpy as np
import json, cv2, logging
import time
import torch
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = YOLO("slight-improved-classify.pt")
model.to(device)

# Map YOLO classes to clothing items
def map_to_clothing_label(id):
    attributes_file = f"attributes.json"

    with open(attributes_file, "r") as f:
        attributes_f = json.load(f)

    # Create train/val directories for each attribute
    attributes = {}

    for item in attributes_f["attributes"]:
        attribute_id = item["id"]
        attribue_name = item["name"]
        attributes[attribute_id] = attribue_name

    return attributes.get(id, id)

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

def classify_segment(segmented_items):
    """Runs classification on the segmented images."""
    results = []
    
    for item in segmented_items["clothing_items"]:
        cropped_img_array = np.array(item["cropped_image"], dtype=np.uint8)

        infer_start_time = time.time()

        # Decode the image array into an OpenCV image
        orig_image = cv2.cvtColor(cropped_img_array, cv2.COLOR_BGR2RGB)

        # Calculate the parameters for image resizing
        model_height, model_width = 640, 640

        # Resize the image as numpy array
        resized_image = cv2.resize(orig_image, (model_height, model_width))

        with torch.no_grad():
            result = model(resized_image)
    
        classification_result = output_fn(result)

        infer_end_time = time.time()

        logger.info(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")
    
        # Ensure 'probs' exist and extract top-5 predictions safely
        if "probs" in classification_result and "top5_indices" in classification_result["probs"]:
            predicted_class_names = [
                map_to_clothing_label(idx) for idx in classification_result["probs"]["top5_indices"]
            ]
        else:
            logger.warning("Missing 'probs' or 'top5' key in classification result.")
            predicted_class_names = []

        # Store the predicted attributes
        item["attributes"] = predicted_class_names
        item.pop("cropped_image")

        results.append(item)

    return results