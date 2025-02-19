import numpy as np
import json
import cv2 
from PIL import Image
import logging
import boto3
import time
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sm_client = boto3.client(service_name="sagemaker")

# Restore the endpoint name stored in the 2_DeployEndpoint.ipynb notebook
ENDPOINT_NAME = "yolov11-slight-improved-classify-2025-02-19-08-43-13-147666"
logger.info(f'Endpoint Name: {ENDPOINT_NAME}')

def check_endpoint():
    endpoint_created = False
    while True:
        response = sm_client.list_endpoints()
        for ep in response['Endpoints']:
            logger.info(f"Endpoint Status = {ep['EndpointStatus']}")
            if ep['EndpointName']==ENDPOINT_NAME and ep['EndpointStatus']=='InService':
                endpoint_created = True
                break
        if endpoint_created:
            break
        time.sleep(5)


# Map YOLO classes to clothing items
def map_to_clothing_label(id):
    attributes_file = f"attributes.json"

    with open(attributes_file, "r") as f:
        attributes_f = json.load(f)

    # Create train/val directories for each attribute
    attributes = {}

    for item in attributes_f["attributes"]:
        attribute_id = item["id"]
        attribue_name = item["name"]
        attributes[attribute_id] = attribue_name

    return attributes.get(id, id)

def classify_segment(segmented_items):
    """Runs classification on the segmented images."""
    results = []

    check_endpoint()
    
    for item in segmented_items["clothing_items"]:
        cropped_img_array = np.array(item["cropped_image"], dtype=np.uint8)

        infer_start_time = time.time()

        runtime= boto3.client('runtime.sagemaker')
        # Decode the image array into an OpenCV image
        orig_image = cv2.cvtColor(cropped_img_array, cv2.COLOR_BGR2RGB)

        # Calculate the parameters for image resizing
        model_height, model_width = 640, 640

        # Resize the image as numpy array
        resized_image = cv2.resize(orig_image, (model_height, model_width))
        # Conver the array into jpeg
        resized_jpeg = cv2.imencode('.jpg', resized_image)[1]
        # Serialize the jpg using base 64
        payload = base64.b64encode(resized_jpeg).decode('utf-8')
        response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                                ContentType='text/csv',
                                                Body=payload)
        response_body = response['Body'].read()
        classification_result = json.loads(response_body.decode('ascii'))

        print("Result: ", classification_result)

        infer_end_time = time.time()

        logger.info(f"Inference Time = {infer_end_time - infer_start_time:0.4f} seconds")
    
        # Ensure 'probs' exist and extract top-5 predictions safely
        if "probs" in classification_result and "top5_indices" in classification_result["probs"]:
            predicted_class_names = [
                map_to_clothing_label(idx) for idx in classification_result["probs"]["top5_indices"]
            ]
        else:
            logger.warning("Missing 'probs' or 'top5' key in classification result.")
            predicted_class_names = []

        # Store the predicted attributes
        item["attributes"] = predicted_class_names
        item.pop("cropped_image")

        results.append(item)

    return results