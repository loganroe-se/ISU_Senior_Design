import json
from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import User
from passlib.hash import bcrypt


def handler(event, context):
    try:
        # Parse the login data from event
        body = json.loads(event['body'])

        # Get all body attributes
        email = body.get('email')
        password = body.get('password')

        # Check for missing, required values
        if not email or not password:
             return create_response(400, 'Missing email or password')

        # Call signIn function
        status_code, message = signIn(email, password)

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error Signing In: {str(e)}")
    

def signIn(email, password):
    # Try to sign in
    try:
        # Create the session
        session = create_session()

        # Query the user by email
        user = session.execute(select(User).where(User.email == email)).scalars().first()

        if user and bcrypt.verify(password, user.password):  # Check hashed password
            return 200, {
                    'username': user.username,
                    'id': user.userID
                }
        else:
            return 401, 'Invalid email or password'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error signing in")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
