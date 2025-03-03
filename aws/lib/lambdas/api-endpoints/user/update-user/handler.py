import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User
from sqlalchemy.exc import IntegrityError
from passlib.hash import bcrypt
import uuid
import boto3
import base64


# S3 configuration
S3_BUCKET = "imageoptimizationstack-s3dripdroporiginalimagebuck-m18zpwypjbuc"
S3_REGION = "us-east-1"
s3_client = boto3.client("s3", region_name=S3_REGION)

def handler(event, context):
    try:
        # Parse the user ID from event
        user_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')

        # Parse the update data from the body
        body = json.loads(event['body'])

        # Get all body attributes
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')
        profilePic = body.get('profilePic')

        # Check for missing, required values
        if not username and not email and not password and not profilePic:
            return create_response(400, 'Missing fields to update')
        
        # Call another function to get all posts
        status_code, message = updateUser(user_id, username, email, password, profilePic)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    

def updateUser(user_id, username, email, password, profilePic):
    # Try to update the user
    try:
        # Create the session
        session = create_session()

        # Fetch the user
        user = session.execute(select(User).where(User.userID == user_id)).scalars().first()

        if user:
            # Update user information
            if username:
                user.username = username
            if email:
                user.email = email
            if password:
                # Hash the new password before saving
                hashed_password = bcrypt.hash(password)
                user.password = hashed_password
            if profilePic:
                if profilePic == "default":
                    user.profilePicURL = "profilePics/default.jpg"
                else:
                    # Decode the image and put into the S3 bucket
                    decoded_image = base64.b64decode(profilePic)

                    image_id = str(uuid.uuid4())
                    s3_key = f"profilePics/{image_id}.jpg"

                    # Upload the image to S3
                    s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)

                    user.profilePicURL = s3_key
                    
            # Commit the changes to the database    
            session.commit()

            return 200, f'User with userID: {user_id} was updated successfully'
        else:
            return 404, f'User with userID: {user_id} was not found'
        
    except IntegrityError as e:
        session.rollback()

        # Check for duplicate email or username in the error message
        if 'email' in str(e.orig):
            error_message = 'Email already exists'
        elif 'username' in str(e.orig):
            error_message = 'Username already exists'
        else:
            error_message = 'Duplicate entry'

        return 409, error_message

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()