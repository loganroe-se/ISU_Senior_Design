import json
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import User
from sqlalchemy import select
import uuid
import boto3
import base64

# S3 configuration
S3_BUCKET = ""
S3_REGION = "us-east-1"
s3_client = boto3.client("s3", region_name=S3_REGION)

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get user id and the image
        userID = body.get('userID')
        image = body.get('image', "")

        # Check for missing, required values
        if not userID:
            return create_response(400, 'Missing required field: userID')
        
        # Call another function to create the user
        status_code, message = updateProfilePic(userID, image)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")
    

def updateProfilePic(userID, image):
    # Try to create the post
    try:
        # Create the session
        session = create_session()

        # Verify if userID exists in the User table
        user = session.query(User).filter_by(userID=userID).first()

        if not user:
            raise Exception("409", f"User with userID: {userID} does not exist")
        
        # If user does not want a profile pic
        if image == "" or image == "None":
            user.profilePicURL = "None"
        # If user uploaded a profile pic
        else:
            # Decode the image and put into the S3 bucket
            decoded_image = base64.b64decode(image)

            image_id = str(uuid.uuid4())
            s3_key = f"profilePics/{image_id}.jpg"

            # Upload the image to S3
            s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=decoded_image)

            user.profilePicURL = s3_key
        
        # Commit the changes to the database
        session.add(user)
        session.commit()  

        # Return success message after the transaction is committed
        return (
            201,
            f"Post with postID: {new_post.postID} by user with userID: {user_id} was created successfully",
        )

    except Exception as e:
        # Handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        # Ensure session is closed
        if "session" in locals() and session:
            session.close()