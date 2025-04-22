from sqlalchemy import select
from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        status_code, message = getUsers()
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving users: {str(e)}")


@session_handler
def getUsers(session):
    try:
        users_result = session.execute(select(User)).scalars().all()

        users_list = [
            {
                'username': user.username,
                'email': user.email,
                'uuid': user.uuid,
                'dob': user.dob.isoformat(),
                'accountType': user.accountType
            }
            for user in users_result
        ]

        return 200, users_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")
