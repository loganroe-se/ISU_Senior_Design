import json
from datetime import date
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User
from utils import create_response, handle_exception

def handler(event, context):
    try:
        body = json.loads(event['body'])

        user_id = body.get('user_id')  # UUID from Cognito
        username = body.get('username')
        email = body.get('email')
        dob = body.get('dob')

        if not all([user_id, username, email, dob]):
            return create_response(400, "Missing fields")

        status_code, message = create_internal_user(user_id, username, email, dob)
        return create_response(status_code, message)

    except Exception as e:
        code, msg = handle_exception(e, "Error writing to DB")
        return create_response(code, msg)


@session_handler
def create_internal_user(session, user_id, username, email, dob):
    try:
        parsed_dob = date.fromisoformat(dob)

        new_user = User(
            uuid=user_id,  # assuming userID maps to UUID in your ORM
            username=username,
            email=email,
            dob=parsed_dob
        )

        session.add(new_user)
        return 201, "User added to DB"

    except Exception as e:
        return handle_exception(e, "Failed to add user to DB")
