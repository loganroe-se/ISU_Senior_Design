from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Image, Post
import base64
import boto3
import uuid
import json
import os

# S3 configuration
S3_BUCKET = "imageoptimizationstack-s3dripdroporiginalimagebuck-m18zpwypjbuc"
S3_REGION = "us-east-1"


s3_client = boto3.client("s3", region_name=S3_REGION)
sqs_client = boto3.client("sqs", region_name=S3_REGION)


def save_image_to_db(session, post_id, images):
    # Connect to the database
    for base54_image in images:
        decoded_image = base64.b64decode(base54_image)

        image_id = str(uuid.uuid4())
        s3_key = f"images/{image_id}.jpg"

        # Upload the image to S3
        s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)

        # Generate the S3 URL or ID
        if (
            post_id
            and not session.execute(select(Post).where(Post.postID == post_id))
            .scalars()
            .first()
        ):
            raise Exception("404", f"Post with postID: {post_id} does not exist")

        # Create a new image
        new_image = Image(postID=post_id, imageURL=s3_key)

        # Add the image to the db
        session.add(new_image)
        session.commit()

        # Construct the return message
        print(f"Image with imageID: {new_image.imageID} was created successfully")

        # Send the image to AI processing
        send_image_to_queue(s3_key, post_id)

    # Return message
    return 201, "Images successfully saved to db"


# Helper method to send images to the queue for AI processing
def send_image_to_queue(s3_key, post_id):
    
    queue_url = os.environ.get("QUEUE_URL")

    if not queue_url:
        raise Exception("500", "Queue URL environment variable not set")
    
    # Create message body
    message_body = {
        "image_path": s3_key,
        "post_id": post_id
    }

    # Send message to the queue
    try:
        response = sqs_client.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(message_body),
            MessageAttributes={
                "EventType": {
                    "StringValue": "Transaction",
                    "DataType": "String"
                }
            }
        )
        
    except Exception as e:
        raise Exception("500", f"Error sending message to queue: {str(e)}")


