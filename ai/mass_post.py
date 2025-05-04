import os
import base64
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Folder containing images
IMAGE_FOLDER = "./seg_dataset/train/images"

# Endpoint and authorization
API_URL = "https://api.dripdropco.com/posts"
BEARER_TOKEN = "ADD_TOKEN_HERE"

# Constant fields
USER_ID = "3"
CAPTION = "Outfit curated by the dripdrop team"

# Headers
HEADERS = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json"
}

# Log file path
LOG_FILE = "post_results.log"

def log(message):
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    full_message = f"{timestamp} {message}"
    print(full_message)
    with open(LOG_FILE, "a") as f:
        f.write(full_message + "\n")

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

def post_image(filename):
    image_path = os.path.join(IMAGE_FOLDER, filename)
    encoded_image = encode_image_to_base64(image_path)

    payload = {
        "userID": USER_ID,
        "caption": CAPTION,
        "images": [encoded_image]
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        result = f"[{filename}] Status: {response.status_code}"
        if response.status_code not in (200, 201):
            result += f" | Error: {response.text}"
        return result
    except Exception as e:
        return f"[{filename}] Exception occurred: {str(e)}"

def confirm_continue(count):
    while True:
        choice = input(f"\nProcessed {count} images. Continue? (y/n): ").strip().lower()
        if choice in ("y", "yes"):
            return True
        elif choice in ("n", "no"):
            return False
        else:
            print("Please enter 'y' or 'n'.")

def main():
    image_files = [
        f for f in os.listdir(IMAGE_FOLDER)
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
    ][:1000]  # Limit to first 1,000 images

    # Clear previous log
    open(LOG_FILE, "w").close()

    processed = 0
    BATCH_SIZE = 100
    MAX_WORKERS = 5

    while processed < len(image_files):
        batch = image_files[processed:processed + BATCH_SIZE]

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(post_image, f): f for f in batch}
            for future in as_completed(futures):
                log(future.result())

        processed += len(batch)
        if processed < len(image_files):
            if not confirm_continue(processed):
                log("Stopped by user.")
                break

if __name__ == "__main__":
    main()
