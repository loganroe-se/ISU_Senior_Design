import torch
from torchvision import transforms
from PIL import Image
import cv2
import json
import numpy as np
from ultralytics import YOLO

from util import detect_dominant_color, map_to_clothing_label, map_to_category_label

# Setting up device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load a COCO-pretrained YOLO11n model
detection_model = YOLO("./trained_models/segmentation_model.pt")
classification_model = YOLO("./trained_models/slight_improved_classify.pt")

# Transform for classification model input
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),  # Match classification model's input size
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

# Run batched inference for detection and segmentation on a list of images
images = ["outfit2.jpg"]
detection_results = detection_model(images)  # Returns a list of Results objects
detection_results[0].save()
items = []
# Process each result
for result in detection_results:
    boxes = result.boxes  # Bounding boxes output
    masks = result.masks  # Segmentation masks output, if available

    # Load the original image
    img = cv2.imread(result.path)

    # Iterate over detected objects
    for i, box in enumerate(boxes):
        # Get bounding box coordinates
        xmin, ymin, xmax, ymax = map(int, box.xyxy[0])
        conf = round(box.conf[0].item(), 2)  # Extract confidence score
        cls_id = box.cls[0].item()  # Extract class ID

        # Crop the detected object from the image
        cropped_img = img[ymin:ymax, xmin:xmax]
        dominant_color = detect_dominant_color(cropped_img)

        image = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
        
        # Apply segmentation mask if available
        # Apply segmentation mask if available
        if masks is not None:
            # Ensure the mask is a NumPy array
            mask = masks.data[i]
            if not isinstance(mask, np.ndarray):
                mask = np.array(mask.cpu().numpy())

            # Resize mask to fit cropped area
            mask_resized = cv2.resize(mask, (xmax - xmin, ymax - ymin))

            # Convert the mask to a binary format if necessary
            _, mask_binary = cv2.threshold(mask_resized, 0.5, 1, cv2.THRESH_BINARY)

            # Apply mask to the cropped image
            cropped_img = cv2.bitwise_and(
                cropped_img, cropped_img, mask=mask_binary.astype(np.uint8)
            )

        # Prepare the cropped image for classification
        pil_image = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
        classification_result = classification_model(pil_image)

        # Retrieve classification probabilities
        attributes = classification_result[
            0
        ].probs.top5  # Contains predicted attributes

        predicted_class_names = [map_to_clothing_label(idx) for idx in attributes]

        item = {
            "item": map_to_category_label(cls_id),
            "confidence": conf,
            "color": dominant_color,
            "coordinates": {"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax},
            "attributes": predicted_class_names,
        }
        items.append(item)

# Convert to JSON format
json_output = json.dumps({"clothing_items": items}, indent=4)
print(json_output)
