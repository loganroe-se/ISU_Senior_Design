import json
from datetime import date
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Comment, User, Post

def handler(event, context):
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        postId = body.get('postId')
        content = body.get('content')

        email = event['requestContext']['authorizer']['claims']['email']

        # Call function to create comment
        status_code, message = createComment(email, postId, content)

        # Return response
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating comment: {str(e)}")

@session_handler
def createComment(session, email, postId, content):
    try:
        user = get_user_by_email(session, email)
        post = session.execute(select(Post).where(Post.postID == postId)).scalars().first()

        if not user or not post:
            return 404, "User or post does not exist."

        new_comment = Comment(
            userID=user.userID,
            postID=postId,
            content=content,
            createdDate=date.today()
        )

        session.add(new_comment)
        return 201, f"User {user.uuid} commented on post {postId}"

    except Exception as e:
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg