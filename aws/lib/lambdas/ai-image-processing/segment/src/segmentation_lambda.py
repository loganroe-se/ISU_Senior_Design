import json
from util import segment_image

def handler(event, context):
    """AWS Lambda handler for segmentation."""
    try:
        image_path = event.get("image_path")
        if not image_path:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'image_path'"})}

        segmentation_output = segment_image(image_path)
        return {"statusCode": 200, "body": json.dumps(segmentation_output)}

    except Exception as e:
        print(f"Error in segmentation: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": "Segmentation failed"})}
