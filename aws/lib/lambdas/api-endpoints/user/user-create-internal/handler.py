# create_internal_user.py
import json
from datetime import date
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User
from utils import create_response, handle_exception

def handler(event, context):
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')        #  get UUID
        username = body.get('username')
        email = body.get('email')
        dob = body.get('dob')

        if not all([user_id, username, email, dob]):
            return create_response(400, "Missing fields")

        dob = date.fromisoformat(dob)
        session = create_session()
        new_user = User(uuid=user_id, username=username, email=email, dob=dob)  #  set UUID as userID
        session.add(new_user)
        session.commit()

        return create_response(201, "User added to DB")

    except Exception as e:
        code, msg = handle_exception(e, "Error writing to DB")
        return create_response(code, msg)

    finally:
        if 'session' in locals() and session:
            session.close()
