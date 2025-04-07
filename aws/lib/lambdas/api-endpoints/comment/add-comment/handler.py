import json
from datetime import date
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_scope
from dripdrop_orm_objects import Comment, User, Post

def handler(event, context):
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userId = body.get('userId')
        postId = body.get('postId')
        content = body.get('content')

        # Check for missing required values
        if not userId or not postId or not content:
            return create_response(400, 'Missing required field')

        # Call function to create comment
        status_code, message = createComment(userId, postId, content)

        # Return response
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating comment: {str(e)}")

@session_handler
def createComment(session, userId, postId, content):
    try:
        # Create session
        # Check if the user and post exist
        user_exists = session.execute(select(User).where(User.userID == userId)).scalars().first()
        post_exists = session.execute(select(Post).where(Post.postID == postId)).scalars().first()

        if not user_exists or not post_exists:
            return 404, "User or post does not exist."

        # Create new comment
        new_comment = Comment(
            userID=userId,
            postID=postId,
            content=content,
            createdDate=date.today()
        )

        # Add comment to database
        session.add(new_comment)
        session.commit()

        # Successful return message
        return 201, f"User {userId} made comment on post {postId} successfully."

    except Exception as e:
        # Handle exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
