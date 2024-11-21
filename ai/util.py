import webcolors
import pandas as pd
import numpy as np
import time
import json
import matplotlib.pyplot as plt
import cv2 as c2
from sklearn.cluster import KMeans


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


# Map YOLO classes to clothing items
def map_to_clothing_label(id):
    attributes_file = f"json/attributes.json"

    with open(attributes_file, "r") as f:
        attributes_f = json.load(f)

    # Create train/val directories for each attribute
    attributes = {}

    for item in attributes_f["attributes"]:
        attribute_id = item["id"]
        attribue_name = item["name"]
        attributes[attribute_id] = attribue_name

    return attributes.get(id, id)


def rgb_to_color_name(rgb_color):
    try:
        return webcolors.rgb_to_name(rgb_color)
    except ValueError:
        # If an exact match is not found, get the closest name
        closest_color = min(
            webcolors._definitions._CSS3_NAMES_TO_HEX,
            key=lambda name: sum(
                (c1 - c2) ** 2
                for c1, c2 in zip(
                    webcolors.hex_to_rgb(
                        webcolors._definitions._CSS3_NAMES_TO_HEX[name]
                    ),
                    rgb_color,
                )
            ),
        )
        return closest_color


def detect_dominant_color(image, k=4):
    # Reshape the image to be a list of pixels
    pixels = image.reshape((-1, 3))
    # Apply K-means clustering to find the dominant color
    kmeans = KMeans(n_clusters=1)
    kmeans.fit(pixels)
    dominant_color = kmeans.cluster_centers_[0].astype(int)

    # Prepare the JSON output
    color_data = {
        "red": int(dominant_color[2]),
        "green": int(dominant_color[1]),
        "blue": int(dominant_color[0]),
    }

    return color_data


def detections_to_dataframe(results, class_names, thres):
    thres = thres / 100
    # Initialize lists to store detection data
    all_boxes = []
    all_confidences = []
    all_class_ids = []
    all_class_names = []
    all_masks = []

    # Iterate over each detection in the results
    for box in results[0].boxes:
        xmin, ymin, xmax, ymax = box.xyxy[0].cpu().numpy()
        cls_id = box.cls[0].item()  # Extract class ID
        conf = round(box.conf[0].item(), 2)  # Extract confidence score

        if conf >= thres:  # Apply threshold
            all_boxes.append([xmin, ymin, xmax, ymax])
            all_confidences.append(conf)
            all_class_ids.append(cls_id)
            all_class_names.append(
                class_names[cls_id]
            )  # Convert class ID to class name

    for mask in results[0].masks:
        all_masks.append(mask.xy)
    # Create a DataFrame
    df = pd.DataFrame(all_boxes, columns=["xmin", "ymin", "xmax", "ymax"])
    df["confidence"] = all_confidences
    df["class"] = all_class_ids
    df["name"] = all_class_names
    df["mask"] = all_masks

    return df


def detect(model, img, thres):
    start = time.time()
    results = model(img, imgsz=1216)
    end = time.time()
    runtime = end - start
    print("Runtime: ", runtime)
    # Convert detections to a DataFrame
    detections_df = detections_to_dataframe(results, model.names, thres)
    return detections_df
