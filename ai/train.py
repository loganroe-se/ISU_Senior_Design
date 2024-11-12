from ultralytics import YOLO
import torch

def train():
    print("CUDA available:", torch.cuda.is_available())
    print("Device count:", torch.cuda.device_count())
    print("Device name:", torch.cuda.get_device_name(0))
    # Initialize a YOLO model, choosing a pretrained model (e.g., YOLOv8n)
    model = YOLO("yolo11n.pt")  # build from YAML and transfer weights

    # Train the model
    model.train(data="./fashionpedia.yaml", epochs=50, imgsz=640)

    results = model.val()  # Evaluate model on validation data

    # Export the trained model weights
    model.export(format="pt", weights="./trained_models/yolo11n-seg-trained.pt")

if __name__ == "__main__":
    train()

