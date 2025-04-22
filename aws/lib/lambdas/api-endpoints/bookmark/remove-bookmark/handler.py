import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Bookmark

def handler(event, context):    
    try:
        body = json.loads(event['body'])
        postId = body.get('postId')

        if not postId:
            return create_response(400, 'Missing required field')
        
        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = deleteBookmark(email, postId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error removing bookmark: {str(e)}")


@session_handler
def deleteBookmark(session, email, postId):
    try:
        user = get_user_by_email(session, email)

        bookmark = session.execute(
            select(Bookmark).where((Bookmark.userID == user.userID) & (Bookmark.postID == postId))
        ).scalars().first()

        if not bookmark:
            return 404, "Bookmark was not found."

        session.delete(bookmark)
        return 200, "Bookmark was removed successfully."

    except Exception as e:
        return handle_exception(e, "Error accessing database")
