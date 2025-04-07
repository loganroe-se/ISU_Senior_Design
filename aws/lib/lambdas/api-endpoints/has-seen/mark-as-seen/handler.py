import json, datetime
from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        body = json.loads(event['body'])

        postIDs = body.get('postIDs')
        email = event['requestContext']['authorizer']['claims']['email']

        if not postIDs:
            return create_response(400, 'Missing required fields: postIDs')

        status_code, message = markAsSeen(email, postIDs)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error marking posts as seen: {str(e)}")


@session_handler
def markAsSeen(session, email, postIDs):
    try:
        # Ensure postIDs is a list
        if isinstance(postIDs, int):
            postIDs = [postIDs]

        user = get_user_by_email(session, email)

        if not user:
            return 404, f"User with userID: {email} was not found"

        posts = session.query(Post).filter(Post.postID.in_(postIDs)).all()
        valid_postIDs = {post.postID for post in posts}

        invalid_postIDs = set(postIDs) - valid_postIDs
        if invalid_postIDs:
            return 404, f"Invalid postIDs: {', '.join(map(str, invalid_postIDs))}"

        # Insert HasSeen entries
        for postID in valid_postIDs:
            session.add(HasSeen(userID=user.userID, postID=postID, timeViewed=datetime.datetime.now()))

        return 200, f"Posts marked as seen successfully for userID: {email}"

    except Exception as e:
        return handle_exception(e, "markAsSeen")
