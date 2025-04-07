import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Like

def handler(event, context):    
    try:
        body = json.loads(event['body'])
        postId = body.get('postId')

        if not postId:
            return create_response(400, 'Missing required field')
        
        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = deleteLike(email, postId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unliking post: {str(e)}")


@session_handler
def deleteLike(session, email, postId):
    try:
        user = get_user_by_email(session, email)

        like = session.execute(
            select(Like).where((Like.userID == user.userID) & (Like.postID == postId))
        ).scalars().first()

        if not like:
            return 404, "Like was not found."

        session.delete(like)
        return 200, "Like was removed successfully."

    except Exception as e:
        return handle_exception(e, "Error accessing database")
