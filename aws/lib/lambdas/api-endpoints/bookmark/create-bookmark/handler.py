import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Bookmark, User, Post

def handler(event, context):
    try:
        body = json.loads(event['body'])
        postId = body.get('postId')

        if not postId:
            return create_response(400, 'Missing required field')

        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = createBookmark(email, postId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating bookmark: {str(e)}")


@session_handler
def createBookmark(session, email, postId):
    try:
        user = get_user_by_email(session, email)

        user_exists = bool(user)
        post_exists = session.execute(
            select(Post).where(Post.postID == postId)
        ).scalars().first()

        if not user_exists or not post_exists:
            return 404, "User or post does not exist."

        existing_bookmark = session.execute(
            select(Bookmark).where(and_(Bookmark.userID == user.userID, Bookmark.postID == postId))
        ).scalars().first()

        if existing_bookmark:
            return 409, "Duplicate bookmark entry: The bookmark already exists."

        new_bookmark = Bookmark(userID=user.userID, postID=postId)
        session.add(new_bookmark)

        return 201, f"User {email} bookmarked post {postId} successfully."

    except Exception as e:
        return handle_exception(e, "Error accessing database")
