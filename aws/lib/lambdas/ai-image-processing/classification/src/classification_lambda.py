import json
import boto3
import uuid
from util import classify_segment


s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ImageProcessingTable")

BUCKET_NAME = "ai-image-processing-results"

def handler(event, context):
    """AWS Lambda handler for classification."""
    try:
        body = json.loads(event.get("body"))
        print("Body Decoded: ", body)
        image_id = body.get("image_id")
        if not image_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'image_id'"})}

        # Retrieve segmentation result S3 URL from DynamoDB
        response = table.get_item(Key={"image_id": image_id})

        if "Item" not in response:
            return {"statusCode": 404, "body": json.dumps({"error": "Image ID not found"})}

        segmentation_s3_url = response["Item"]["segmentation_s3_url"]
        
        # Parse S3 bucket and key from URL
        bucket_name = segmentation_s3_url.split('/')[2].split('.')[0]
        s3_key = '/'.join(segmentation_s3_url.split('/')[3:])

        # Fetch segmentation result from S3
        segmentation_result = json.loads(
            s3.get_object(Bucket=bucket_name, Key=s3_key)["Body"].read()
        )

        print("res: ", segmentation_result)
        # Perform classification (dummy classification here)
        print("Classifying")
        classified_output = classify_segment(segmentation_result)

        # Generate unique image ID
        image_id = str(uuid.uuid4())

        s3_key = f"classify_results/{image_id}.json"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json.dumps(classified_output),
            ContentType="application/json"
        )

        s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"

        # Store metadata in DynamoDB
        table.put_item(Item={
            "image_id": image_id,
            "classify_s3_url": s3_url
        })

        return {
            "statusCode": 200,
            "body": json.dumps({"image_id": image_id, "classify_s3_url": s3_url})
        }

    except Exception as e:
        print(f"Error in classification: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": "Classification failed"})}









