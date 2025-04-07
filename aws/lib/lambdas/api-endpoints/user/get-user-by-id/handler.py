from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        user_id = event['pathParameters'].get('id')

        if not user_id:
            return create_response(400, 'Missing user ID')

        status_code, message = getUserById(user_id)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")


@session_handler
def getUserById(session, user_id):
    try:
        user = session.execute(
            select(User).where(User.userID == user_id)
        ).scalars().first()

        if not user:
            return 404, f'User with userID: {user_id} was not found'

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
