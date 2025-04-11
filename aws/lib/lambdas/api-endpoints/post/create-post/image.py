import base64, os
import boto3
import uuid
from sqlalchemy import select
from utils import handle_exception
from dripdrop_orm_objects import Image, Post

# S3 configuration
S3_BUCKET = "imageoptimizationstack-s3dripdroporiginalimagebuck-m18zpwypjbuc"
S3_REGION = "us-east-1"
s3_client = boto3.client("s3", region_name=S3_REGION)

def save_image_to_db(session, post_id, images):
    try:
        image_paths = [];
        for base64_image in images:
            try:
                decoded_image = base64.b64decode(base64_image, validate=True)
            except Exception:
                raise Exception("400", "Invalid base64 encoding")
          
            image_type = detect_image_type(decoded_image)
            if not image_type:
                raise Exception("400", "Unsupported or invalid image format")

            content_type = f"image/{image_type}"
            image_id = uuid.uuid4().hex

            s3_key = f"images/{image_id}.jpg"
            image_paths.append(s3_key);

            # Upload the image to S3
            s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image, ContentType=content_type)

            # Check that the post exists
            if not session.execute(select(Post).where(Post.postID == post_id)).scalars().first():
                raise Exception("404", f"Post with postID: {post_id} does not exist")

            # Create and add new image
            new_image = Image(postID=post_id, imageURL=s3_key)
            session.add(new_image)

            print(f"Image with imageID: {new_image.imageID} was created successfully")

        return image_paths

    except Exception as e:
        code, msg = handle_exception(e, "save_image_to_db")
        raise Exception("400", "Error saving image to db")

def detect_image_type(data: bytes):
    if data.startswith(b'\xff\xd8'):
        return 'jpeg'
    elif data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    elif data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
        return 'gif'
    elif data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        return 'webp'
    elif data.startswith(b'\x00\x00\x00\x1cftypavif'):
        return 'avif'
    return None
