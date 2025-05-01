import os
import numpy as np
import json, cv2, logging, time
import torch
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MODEL_SIZE = (640, 640)
ATTRIBUTES_PATH = "attributes.json"
BATCH_SIZE = 10  # Adjustable batch size

# Load model based on environment variable
model_name = os.getenv('MODEL_NAME')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f"Loading model: {model_name} onto device: {device}")
model = YOLO(model_name).to(device)

# Load attribute map once
with open(ATTRIBUTES_PATH, "r") as f:
    _ATTRIBUTE_MAP = {item["id"]: item["name"] for item in json.load(f)["attributes"]}

def map_to_clothing_label(class_id):
    return _ATTRIBUTE_MAP.get(class_id, str(class_id))

def output_fn(prediction_output):
    parsed = []
    for result in prediction_output:
        entry = {}
        if 'probs' in result._keys and result.probs is not None:
            top5_indices = result.probs.top5
            top5_scores = result.probs.top5conf.tolist()

            # Filter based on confidence threshold
            filtered_indices = []
            filtered_scores = []
            for idx, score in zip(top5_indices, top5_scores):
                if score >= 0.1:
                    filtered_indices.append(idx)
                    filtered_scores.append(score)

            entry['top5_indices'] = filtered_indices
            entry['top5_scores'] = filtered_scores

        parsed.append(entry)
    return parsed


def chunked(iterable, size):
    """Yield successive chunks of a given size."""
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

def classify_segment(segmented_items):
    """Batch classify attributes of clothing items using YOLO in chunks."""
    items = segmented_items.get("clothing_items", [])
    if not items:
        return []

    results = []

    for batch_items in chunked(items, BATCH_SIZE):
        batch_images = []

        for item in batch_items:
            cropped_img_array = np.array(item["cropped_image"], dtype=np.uint8)
            image_rgb = cv2.cvtColor(cropped_img_array, cv2.COLOR_BGR2RGB)
            resized_image = cv2.resize(image_rgb, MODEL_SIZE)
            batch_images.append(resized_image)

        logger.info(f"Running batch of {len(batch_images)} items...")
        start = time.time()

        with torch.no_grad():
            batch_result = model(batch_images)

        duration = time.time() - start
        logger.info(f"Batch inference time: {duration:.4f} seconds")

        predictions = output_fn(batch_result)

        for item, pred in zip(batch_items, predictions):
            top5 = pred.get("top5_indices", [])
            item["attributes"] = [map_to_clothing_label(idx) for idx in top5]
            item.pop("cropped_image", None)
            results.append(item)

    return results
