from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        username = event['pathParameters'].get('username')

        if not username:
            return create_response(400, 'Missing username')

        status_code, message = getUserByUsername(username)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")


@session_handler
def getUserByUsername(session, username):
    try:
        user = session.execute(
            select(User).where(User.username == username)
        ).scalars().first()

        if not user:
            return 404, f'User with username: {username} was not found'

        user_data = {
            'id': user.userID,
            'username': user.username,
            'email': user.email,
            'profilePic': user.profilePicURL,
            'dob': user.dob.isoformat(),
            'accountType': user.accountType
        }

        return 200, user_data

    except Exception as e:
        return handle_exception(e, "Error accessing database")
