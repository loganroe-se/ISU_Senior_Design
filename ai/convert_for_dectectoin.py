import os
from datasets import load_dataset

# Load the fashionpedia dataset
ds = load_dataset("detection-datasets/fashionpedia")
print(ds['train'].features)



# Directories for YOLO format data
os.makedirs("yolo_data/train/images", exist_ok=True)
os.makedirs("yolo_data/train/labels", exist_ok=True)
os.makedirs("yolo_data/val/images", exist_ok=True)
os.makedirs("yolo_data/val/labels", exist_ok=True)

def convert_bbox_to_yolo(bbox, img_width, img_height):
    # bbox format is [x_min, y_min, x_max, y_max] (Pascal VOC)
    x_min, y_min, x_max, y_max = bbox
    x_center = (x_min + x_max) / 2.0 / img_width
    y_center = (y_min + y_max) / 2.0 / img_height
    width = (x_max - x_min) / img_width
    height = (y_max - y_min) / img_height
    return x_center, y_center, width, height

def save_yolo_format(example, split="train"):
    image = example["image"]
    img_width, img_height = example["width"], example["height"]
    image_id = example["image_id"]
    
    # Save the image to the respective folder
    image_path = f"yolo_data/{split}/images/{image_id}.jpg"
    image.save(image_path)
    
    # Create label file
    label_path = f"yolo_data/{split}/labels/{image_id}.txt"
    with open(label_path, "w") as f:
        for category, bbox in zip(example["objects"]["category"], example["objects"]["bbox"]):
            x_center, y_center, width, height = convert_bbox_to_yolo(bbox, img_width, img_height)
            f.write(f"{category} {x_center} {y_center} {width} {height}\n")

# Apply conversion for train and validation splits
for example in ds["train"]:
    save_yolo_format(example, "train")

for example in ds["val"]:
    save_yolo_format(example, "val")