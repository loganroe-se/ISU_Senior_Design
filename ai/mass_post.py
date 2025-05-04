import os
import base64
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Folder containing images
IMAGE_FOLDER = "./seg_dataset/train/images"

# Endpoint and authorization
API_URL = "https://api.dripdropco.com/posts"
BEARER_TOKEN = "eyJraWQiOiJhVUVNQjU1MVhaSEdYcHRjcXRQS1RyTVYrOW8xUWwwblc2OXpWVXJwaTM0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5NDA4ZjQ0OC0wMGUxLTcwMDEtMjg5ZS0wOGJmYmMzZjAwZTkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfeGI0d3lwYW1jIiwiY29nbml0bzp1c2VybmFtZSI6Ijk0MDhmNDQ4LTAwZTEtNzAwMS0yODllLTA4YmZiYzNmMDBlOSIsIm9yaWdpbl9qdGkiOiJkNDJmNDQzNS0yNDIzLTRkOWMtYjE4Ny05ODBiZjAxMWUxNzYiLCJhdWQiOiI1Nm05MTBjc2hxZXVuYXIyZmRpODI3cjZnZCIsImV2ZW50X2lkIjoiMzVmZmI2NTAtYjY2My00Y2Q4LTk0NzktODM2MzFkMDAyZmMxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDYzMzI3MDAsIm5hbWUiOiJkcmlwZHJvcCIsImV4cCI6MTc0NjMzNjMwMCwiaWF0IjoxNzQ2MzMyNzAwLCJqdGkiOiI5MzZiNGY5MS0zMDI3LTQxZjUtYjdkNi0zMDJmMWQ2YjE4MTgiLCJlbWFpbCI6ImRyaXBkcm9wQGRyaXBkcm9wY28uY29tIn0.qc4-9q9weLb03APIxh5-t9uLHqPF_nKhfCdpJNRpTiyj1_lgD14GDFCoT0JVKZF62OZRrIGU7fpeY0q3B8zVkna3cKYrIlllL8PN0464d7sBIvmDR57dLIfqYsezn45aXF-o0UoDdpzIifjfdNLp446p6d8z6PzPCkeiK6RIlLT-iNTj3Ugfk0uQW39n9cFdZrPO5xv4FX8iTl_Ck8eWdUnRiSRYnSKgjYilTQD6_Mfg6QUZsTkRkjsLwGFmw2mPuokKK-T_7z2gcCmJCKAG6zYwvPSpTeI_rQA697k7-nXOiwaKNe6V9ZYg2olYf8hsxykg0h0FM6vfssBPfujYgA"

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
