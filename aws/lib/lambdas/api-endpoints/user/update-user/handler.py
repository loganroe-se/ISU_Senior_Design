import json
import uuid  # <- keep this
import boto3
import base64
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User
from passlib.hash import bcrypt

# S3 configuration
S3_BUCKET = "imageoptimizationstack-s3dripdroporiginalimagebuck-m18zpwypjbuc"
S3_REGION = "us-east-1"
s3_client = boto3.client("s3", region_name=S3_REGION)

def handler(event, context):
    try:
        user_uuid = event['pathParameters'].get('uuid')  # ✅ renamed
        if not user_uuid:
            return create_response(400, 'Missing user ID')

        body = json.loads(event['body'])

        username = body.get('username')
        profilePic = body.get('profilePic')

        if not any([username, profilePic]):
            return create_response(400, 'Missing fields to update')

        status_code, message = updateUser(user_uuid, username, profilePic)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")


@session_handler
def updateUser(session, user_uuid, username, profilePic):  # ✅ updated param name
    try:
        user = session.execute(select(User).where(User.uuid == user_uuid)).scalars().first()

        if not user:
            return 404, f'User with uuid: {user_uuid} was not found'

        if username:
            user.username = username
        
        print("profilepic: ", profilePic)

        if profilePic:
            if profilePic == "default":
                user.profilePicURL = "profilePics/default.jpg"
            else:
                decoded_image = base64.b64decode(profilePic)
                image_id = str(uuid.uuid4())  # ✅ now correctly calls the uuid module
                s3_key = f"profilePics/{image_id}.jpg"
                s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)
                user.profilePicURL = s3_key

        return 200, f'User with uuid: {user_uuid} was updated successfully'

    except Exception as e:
        return handle_exception(e, "Error accessing database")
