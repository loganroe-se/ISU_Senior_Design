import ultralytics
import torch

def train():
    print("CUDA available:", torch.cuda.is_available())
    print("Device count:", torch.cuda.device_count())
    print("Device name:", torch.cuda.get_device_name(0))
    # Initialize a YOLO model, choosing a pretrained model (e.g., YOLOv8n)
    model = ultralytics.YOLO("models/last.pt")  # build from YAML and transfer weights

    # Train the model
    model.train(data="classify", epochs=10, imgsz=640, batch=16) 

    results = model.val()  # Evaluate model on validation data

    # Export the trained model weights
    model.export()

if __name__ == "__main__":
    train()

