from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = resetSeenPosts(email)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error resetting seen posts: {str(e)}")


@session_handler
def resetSeenPosts(session, email):
    try:
        user = get_user_by_email(session, email)

        if not user:
            return 404, f"User with userID: {email} was not found"

        deleted_rows = session.query(HasSeen).filter_by(userID=user.userID).delete()

        if deleted_rows == 0:
            return 404, f"No posts have been seen by user with userID: {email}"

        return 200, f"Successfully reset seen posts for user with userID: {email}"

    except Exception as e:
        return handle_exception(e, "ResetSeenPostsByUserID")
