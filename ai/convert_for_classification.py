import json
import os
from pathlib import Path
import cv2
import numpy as np
from PIL import Image



def save_yolo_format(split="train"):
    # Paths to images and annotation file
    images_dir = f"seg_dataset/{split}/images"
    dataset_dir = "cls_dataset"  # Root directory for YOLO classification dataset
    annotations_file = f"json/instances_attributes_{split}2020.json"
    attributes_file = f"json/attributes.json"

    # Load Fashionpedia annotations
    with open(annotations_file, "r") as f:
        annotations = json.load(f)
    
    with open(attributes_file, "r") as f:
        attributes_f = json.load(f)

    # Create train/val directories for each attribute
    attributes = {}

    for item in attributes_f["attributes"]:
        attribute_id = item["id"]
        attribue_name = item["name"]
        attributes[attribute_id] = attribue_name 

    for attribute in attributes:
        os.makedirs(Path(dataset_dir) / split / attributes[attribute], exist_ok=True)

    image_dict = {}
    # Process each image in the annotations
    for ann in annotations["annotations"]:
        image_id = ann["image_id"]
        
        if image_dict.get(image_id, None) is not None:
            image_file_name = image_dict.get(image_id);
        else:
            for image_data in annotations["images"]:
                i_id = image_data["id"]
                if (image_id == i_id):
                    image_file_name = os.path.splitext(image_data["file_name"])
                    image_dict[image_id] = image_file_name

        image_path = Path(images_dir) / f"{image_file_name[0]}.jpg"  # Adjust extension if needed
        img = cv2.imread(image_path);
        segmentation_polygons = ann['segmentation']
        mask = np.zeros(img.shape[:2], dtype=np.uint8)

        try:        # Loop through each polygon in the segmentation array and draw it on the mask
            for polygon_points in segmentation_polygons:
                # Convert the list of points to a numpy array of shape (-1, 1, 2) for OpenCV
                polygon = np.array(polygon_points, dtype=np.int32).reshape(-1, 1, 2)
                # Fill the mask with the polygon
                cv2.fillPoly(mask, [polygon], 255)
        except ValueError as e:
            continue

        # Use the mask to segment the object in the image
        segmented_image = cv2.bitwise_and(img, img, mask=mask)
        pil_image = Image.fromarray(cv2.cvtColor(segmented_image, cv2.COLOR_BGR2RGB))
        # # Get attribute labels for the item
        item_attributes = ann.get("attribute_ids", [])  # Replace with actual attribute key in Fashionpedia JSON

        # # Copy images to attribute folders
        for attribute in item_attributes:
            if attribute in attributes:  # Ensure attribute is recognized
                dest_path = Path(dataset_dir) / split / attributes[attribute] / f"{image_file_name[0]}.jpg"
                pil_image.save(dest_path)


save_yolo_format(split="train")