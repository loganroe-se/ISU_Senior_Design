import json
from image import save_image_to_db
from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User
from datetime import date
import boto3, os

SQS_QUEUE_URL = os.environ['SQS_QUEUE_URL']
sqs = boto3.client('sqs')


def handler(event, context):
    try:
        body = json.loads(event['body'])
        caption = body.get('caption', "")
        images = body.get('images')

        email = event['requestContext']['authorizer']['claims']['email']


        status_code, message = createPost(email, caption, images)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")


@session_handler
def createPost(session, email, caption, images):
    try:
        user = get_user_by_email(session, email)

        user_exists = bool(user)
        if not user_exists:
            return 409, f"User with email: {email} does not exist"

        createdDate = date.today()
        new_post = Post(userID=user.userID, caption=caption, createdDate=createdDate)
        session.add(new_post)
        session.flush()  # ensures new_post.postID is available before image insert

        image_paths = save_image_to_db(session, new_post.postID, images)

        for path in image_paths:
            if not path:
                continue

            sqs.send_message(
                QueueUrl=SQS_QUEUE_URL,
                MessageBody=json.dumps({
                    "image_path": path
                })
            )

        return 201, f"Post with postID: {new_post.postID} by user with email: {email} was created successfully"

    except Exception as e:
        return handle_exception(e, "Error accessing database")
