import numpy as np
import time, json, cv2, boto3
import json, logging, requests, base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sm_client = boto3.client(service_name="sagemaker")

# Restore the endpoint name stored in the 2_DeployEndpoint.ipynb notebook
ENDPOINT_NAME = "yolov11-segmentation-model-2025-02-19-08-39-10-178747"
logger.info(f"Endpoint Name: {ENDPOINT_NAME}")


def check_endpoint():
    endpoint_created = False
    while True:
        response = sm_client.list_endpoints()
        for ep in response["Endpoints"]:
            logger.info(f"Endpoint Status = {ep['EndpointStatus']}")
            if (
                ep["EndpointName"] == ENDPOINT_NAME
                and ep["EndpointStatus"] == "InService"
            ):
                endpoint_created = True
                break
        if endpoint_created:
            break
        time.sleep(5)


def map_to_category_label(id):
    categories_file = f"categories.json"

    with open(categories_file, "r") as f:
        categories_f = json.load(f)

    # Create train/val directories for each attribute
    categories = {}

    for item in categories_f["categories"]:
        categories_id = item["id"]
        categories_name = item["name"]
        categories[categories_id] = categories_name

    return categories.get(id, id)


def detect_dominant_color(image):
    # Reshape the image to a list of pixels
    pixels = image.reshape((-1, 3))

    # Compute the average color
    avg_color = np.mean(pixels, axis=0).astype(int)

    # Prepare the JSON output
    color_data = {
        "red": int(avg_color[2]),
        "green": int(avg_color[1]),
        "blue": int(avg_color[0]),
    }

    return color_data

def get_image(image_path):
    image_url = f"https://cdn.dripdropco.com/{image_path}?format=jpeg"

            # Fetch the Base64 content directly
    response = requests.get(image_url)
    response.raise_for_status()  # Ensure the request was successful
    
    return response.content
        



def segment_image(image_path):
    """Runs segmentation on the input image and returns detected objects."""
    check_endpoint()

    infer_start_time = time.time()
    
    print("Fetching image")
    image = get_image(image_path)
    print("Image fetched")

    # Convert the response content into a NumPy array
    image_array = np.frombuffer(image, np.uint8)

    # Decode the image array into an OpenCV image
    orig_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    # orig_image = cv2.imread('outfit.jpg')

    # Calculate the parameters for image resizing
    model_height, model_width = 640, 640

    # Resize the image as numpy array
    resized_image = cv2.resize(orig_image, (model_height, model_width))
    # Conver the array into jpeg
    resized_jpeg = cv2.imencode('.jpg', resized_image)[1]
    # Serialize the jpg using base 64
    payload = base64.b64encode(resized_jpeg).decode('utf-8')

    runtime= boto3.client('runtime.sagemaker')
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                            ContentType='text/csv',
                                            Body=payload)
    response_body = response['Body'].read()
    detection_results = json.loads(response_body.decode('ascii'))

    infer_end_time = time.time()

    print(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")

    # Retrieve detection outputs
    boxes = detection_results.get("boxes", [])
    masks = detection_results.get("masks", None)

    # Get image dimensions
    model_height, model_width = 640, 640

    items = []

    for i, box in enumerate(boxes):
        # Extract bounding box details
        xmin, ymin, xmax, ymax = map(int, box[:4])
        conf = round(box[4], 2)
        cls_id = int(box[5])
        
        # Crop the detected region
        cropped_img = orig_image[ymin:ymax, xmin:xmax]
        dominant_color = detect_dominant_color(cropped_img)  # Custom function

        # Apply segmentation mask if available
        if masks is not None:
            mask = np.array(masks[i])
            mask_resized = cv2.resize(mask, (xmax - xmin, ymax - ymin))
            _, mask_binary = cv2.threshold(mask_resized, 0.5, 1, cv2.THRESH_BINARY)
            cropped_img = cv2.bitwise_and(
                cropped_img, cropped_img, mask=mask_binary.astype(np.uint8)
            )

        item = {
            "item": map_to_category_label(cls_id),  # Custom function
            "confidence": conf,
            "color": dominant_color,
            "coordinates": {"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax},
            "cropped_image": cropped_img.tolist(),  # Convert NumPy array to list
        }
        items.append(item)

    return {"clothing_items": items}