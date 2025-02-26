import json
import boto3
import uuid
from util import segment_image

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ImageProcessingTable")

BUCKET_NAME = "ai-image-processing-results"

def handler(event, context):
    print("Running Handler")
    """AWS Lambda handler for segmentation."""
    try:
        image_path = event.get("image_path")
        if not image_path:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'image_path'"})}

        # Generate unique image ID
        image_id = str(uuid.uuid4())

        # Perform segmentation
        segmentation_output = segment_image(image_path)

        # Save segmentation output to S3
        s3_key = f"segmentation_results/{image_id}.json"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json.dumps(segmentation_output),
            ContentType="application/json"
        )

        s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"

        # Store metadata in DynamoDB
        table.put_item(Item={
            "image_id": image_id,
            "image_path": image_path,
            "segmentation_s3_url": s3_url
        })

        return {
            "statusCode": 200,
            "body": json.dumps({"image_id": image_id, "segmentation_s3_url": s3_url})
        }

    except Exception as e:
        print(f"Error in segmentation: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": "Segmentation failed"})}
