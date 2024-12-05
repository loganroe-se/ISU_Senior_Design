from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Image, Post
import base64
import boto3
import uuid

# S3 configuration
S3_BUCKET = ""
S3_REGION = ""


s3_client = boto3.client("s3", region_name=S3_REGION)

def save_image_to_db(post_id, base64_image):
    try:
        # Connect to the database
        session = create_session()

        decoded_image = base64.b64decode(base64_image)

        image_id = str(uuid.uuid4())
        s3_key = f"images/{image_id}.jpg"

        # Upload the image to S3
        s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)

        # Generate the S3 URL or ID
        s3_image_id = f"s3://{S3_BUCKET}/{s3_key}"

        if post_id and not session.execute(select(Post).where(Post.postID == post_id)).scalars().first():
            raise Exception("404", f'Post with postID: {post_id} does not exist')

        # Create a new image
        new_image = Image(postID=post_id, imageURL=s3_image_id)

        # Add the image to the db
        session.add(new_image)
        session.commit()

        # Construct the return message
        if post_id:
            message = f"Image with imageID: {new_image.imageID} and postID: {post_id} was created successfully"
        else:
            message = f"Image with imageID: {new_image.imageID} was created successfully"

        # Return message
        return 201, message

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Image.py")
        return code, msg