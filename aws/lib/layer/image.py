from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Image, Post
import base64
import boto3
import uuid

# S3 configuration
S3_BUCKET = "imageoptimizationstack-s3dripdroporiginalimagebuck-m18zpwypjbuc"
S3_REGION = "us-east-1"


s3_client = boto3.client("s3", region_name=S3_REGION)


def save_image_to_db(session, post_id, images):
    try:
        # Begin a transaction
        with session.begin():
            for base64_image in images:
                # Decode the image from Base64
                decoded_image = base64.b64decode(base64_image)

                # Generate a unique ID for the image
                image_id = str(uuid.uuid4())
                s3_key = f"images/{image_id}.jpg"

                # Upload the image to S3
                s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)

                # Generate the S3 URL or ID
                s3_image_id = f"s3://{S3_BUCKET}/{s3_key}"

                # Ensure the post exists
                if (
                    post_id
                    and not session.execute(select(Post).where(Post.postID == post_id))
                    .scalars()
                    .first()
                ):
                    raise Exception("404", f"Post with postID: {post_id} does not exist")

                # Create a new image record
                new_image = Image(postID=post_id, imageURL=s3_image_id)

                # Add the image to the database
                session.add(new_image)

        # Return success message
        return 201, "Images successfully saved to db"

    except Exception as e:
        # Handle the exception and print/log it
        print(f"Error occurred: {e}")
        raise  # Re-raise the exception for upstream handling
