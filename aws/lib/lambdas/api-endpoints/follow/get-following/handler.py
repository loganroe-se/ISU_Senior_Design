from utils import create_response, handle_exception
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Get user ID from path parameters
        uuid = event['pathParameters'].get('id')
        
        # Check for missing required value
        if not uuid:
            return create_response(400, 'Missing uuid')

        status_code, message = getFollowing(uuid)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving following list: {str(e)}")


@session_handler
def getFollowing(session, uuid):
    try:
        user = session.query(User).filter(User.uuid == uuid).one_or_none()

        # If user does not exist, return 404
        if not user:
            return 404, f"User with uuid {uuid} does not exist."
        
        following = [
            {
                "uuid": follow.followed.uuid,
                "username": follow.followed.username,
            }
            for follow in user.following
        ]

        return 200, following

    except Exception as e:
        return handle_exception(e, "Error accessing database")
