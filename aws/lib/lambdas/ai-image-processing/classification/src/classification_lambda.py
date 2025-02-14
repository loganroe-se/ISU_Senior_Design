import json
from util import classify_segment

def handler(event, context):
    """AWS Lambda handler for classification."""
    try:
        segmented_items = json.loads(event["body"])  # Receive JSON from previous Lambda
        classified_output = classify_segment(segmented_items)
        return {"statusCode": 200, "body": json.dumps(classified_output)}

    except Exception as e:
        print(f"Error in classification: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": "Classification failed"})}
