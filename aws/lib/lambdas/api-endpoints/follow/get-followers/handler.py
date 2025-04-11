from utils import create_response, handle_exception
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Get user ID from path parameters
        uuid = event['pathParameters'].get('id')

        if not uuid:
            return create_response(400, 'Missing uuid')
   
        status_code, message = getFollowers(uuid)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving followers: {str(e)}")


@session_handler
def getFollowers(session, uuid):
    try:
        user = session.query(User).filter(User.uuid == uuid).one_or_none()

        # If user does not exist, return 404
        if not user:
            return 404, f"User with uuid {uuid} does not exist."

        followers = [
            {
                "uuid": follow.follower.uuid,
                "username": follow.follower.username,
            }
            for follow in user.followers
        ]

        return 200, followers

    except Exception as e:
        return handle_exception(e, "Error accessing database")
