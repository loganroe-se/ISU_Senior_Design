import json
import os
from pathlib import Path


# Parse each annotation
def save_yolo_format(split="train"):
    # Paths to images and annotation files
    images_dir = f"dataset/{split}/images"
    labels_dir = f"dataset/{split}/labels"
    annotations_file = f"json/instances_attributes_{split}2020.json"

    # Load Fashionpedia annotations
    with open(annotations_file, "r") as f:
        annotations = json.load(f)

    # Create labels directory if it doesn't exist
    os.makedirs(labels_dir, exist_ok=True)

    for image_data in annotations["images"]:
        image_id = image_data["id"]
        width, height = image_data["width"], image_data["height"]
        image_file_name = os.path.splitext(image_data["file_name"])
        label_file = Path(labels_dir) / f"{image_file_name[0]}.txt"

        # Open label file for writing
        with open(label_file, "w") as f:
            # Get annotations for this image
            for ann in annotations["annotations"]:
                if ann["image_id"] == image_id:
                    category_id = ann["category_id"]
                    # Process all polygons
                    for polygon in ann["segmentation"]:
                        normalized_segmentation = []
                        contains_string = any(isinstance(element, str) for element in polygon)
                        if (contains_string):
                            continue
                        for i in range(0, len(polygon), 2):
                            

                            x = polygon[i] / width  # Normalize x-coordinate
                            y = polygon[i + 1] / height  # Normalize y-coordinate
                            normalized_segmentation.extend([x, y])

                        # Write each polygon as a new line in YOLO format
                        yolo_line = (
                            f"{category_id} "
                            + " ".join(map(str, normalized_segmentation))
                            + "\n"
                        )
                        f.write(yolo_line)


save_yolo_format(split="train")
