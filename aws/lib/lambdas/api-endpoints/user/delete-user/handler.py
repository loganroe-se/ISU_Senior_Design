from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from utils import handle_exception, create_response
from dripdrop_orm_objects import User

def handler(event, context):    
    try:
        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = deleteUser(email)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error deleting user: {str(e)}")


@session_handler
def deleteUser(session, user_id):
    try:
        user = get_user_by_email(session, email)

        if not user:
            return 404, f'User with userID: {user_id} was not found'

        session.delete(user)
        return 200, f'User with userID: {user_id} was deleted successfully'

    except Exception as e:
        return handle_exception(e, "Error accessing database")
