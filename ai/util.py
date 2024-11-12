from sklearn.cluster import KMeans
import webcolors
import pandas as pd
import numpy as np
import time
import cv2


# Map YOLO classes to clothing items
def map_to_clothing_label(label):
    print("Label: ", label)
    mapping = {
        "person": "model",
        "suitcase": "luggage",
        "backpack": "backpack",
    }
    return mapping.get(label, label)


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

    # Convert to float for kmeans
    pixels = np.float32(pixels)

    # Perform k-means clustering to find dominant colors
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(pixels)
    dominant_color = kmeans.cluster_centers_[0]  # Get the dominant color (RGB)

    color_name = rgb_to_color_name(dominant_color)
    print(f"Detected color: {color_name}")

    return color_name


def detections_to_dataframe(results, class_names, thres):
    thres = thres / 100
    # Initialize lists to store detection data
    all_boxes = []
    all_confidences = []
    all_class_ids = []
    all_class_names = []

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

    # Create a DataFrame
    df = pd.DataFrame(all_boxes, columns=["xmin", "ymin", "xmax", "ymax"])
    df["confidence"] = all_confidences
    df["class"] = all_class_ids
    df["name"] = all_class_names

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

# Assuming `detected_objects` contains the bounding boxes and class labels
def save_image_with_detections(img, detected_objects, output_path="output_with_detections.jpg"):
    for _, row in detected_objects.iterrows():
        # Get coordinates and label
        xmin, ymin, xmax, ymax = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
        label = map_to_clothing_label(row['name'])
        confidence = row['confidence']
        
        # Draw bounding box
        cv2.rectangle(img, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)  # Green box
        label_text = f"{label} ({confidence:.2f})"
        
        # Draw label and confidence above the bounding box
        cv2.putText(img, label_text, (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Save the output image
    cv2.imwrite(output_path, img)
    print(f"Output image saved as {output_path}")
