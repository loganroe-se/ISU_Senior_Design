from util import detect_dominant_color, map_to_clothing_label, detect, save_image_with_detections
import torch
from torchvision import transforms
from PIL import Image
import cv2
import json
from ultralytics import YOLO

# Setting up device 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load a COCO-pretrained YOLO11n model
model = YOLO("./trained_models/best.pt")

#Temp categories for image classification as model is not trained
with open("imagenet_classes.txt", "r") as f:
    categories = [s.strip() for s in f.readlines()]

classification_model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
classification_model.fc = torch.nn.Linear(classification_model.fc.in_features, len(categories))  # Modify last layer for multi-label classification
classification_model = classification_model.to(device)


# Transform for input image
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# Load the image
image_path = 'test.jpg'
img = cv2.imread(image_path)

detected_objects = detect(model=model, img=img, thres=50)
save_image_with_detections(img, detected_objects, "detected_outfit_with_boxes_pretrained_test.jpg")
# Extract relevant information
items = []
i = 0 
for _, row in detected_objects.iterrows():
    xmin, ymin, xmax, ymax = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
    clothing_item = (img[ymin:ymax, xmin:xmax])
  
    dominant_color = detect_dominant_color(clothing_item)

    # Preprocess the cropped image for texture/pattern classification
    image = Image.fromarray(clothing_item)
    input_tensor = transform(image).unsqueeze(0).to(device)

    # Predict texture/pattern
    classification_model.eval()
    with torch.no_grad():
        output = classification_model(input_tensor)
        
        probabilities = torch.nn.functional.softmax(output[0], dim=0)

        # Show top categories per image
        top5_prob, top5_catid = torch.topk(probabilities, 5)

        # Get class names for all predicted indices
        predicted_class_names = [categories[idx] for idx in top5_catid]
        # print(f"Predicted classes: {predicted_class_names}")

    item = {
        "item": map_to_clothing_label(row['name']),
        "confidence": row['confidence'],
        "color": dominant_color,
        "coordinates": {
            "xmin": row['xmin'],
            "ymin": row['ymin'],
            "xmax": row['xmax'],
            "ymax": row['ymax']
        }, 
        "attributes": predicted_class_names
    }
    items.append(item)
    
# Convert to JSON format
json_output = json.dumps({"clothing_items": items}, indent=4)
print(json_output)
