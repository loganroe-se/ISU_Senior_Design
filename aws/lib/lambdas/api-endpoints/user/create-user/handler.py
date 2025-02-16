import json
from sqlalchemy.exc import IntegrityError
from sqlalchemy_utils import create_session
from utils import handle_exception, create_response
from dripdrop_orm_objects import User
from passlib.hash import bcrypt

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        # Check for missing, required values
        if not username or not email or not password:
            return create_response(400, 'Missing required field')
        
        # Call another function to create the user
        status_code, message = createUser(username, email, password)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating user: {str(e)}")
    

def createUser(username, email, password):
    # Try to create the user
    try:
        # Create the session
        session = create_session()

        # Hash the password
        hashed_password = bcrypt.hash(password)

        # Create a new user
        new_user = User(username=username, email=email, password=hashed_password)

        # Add the user to the db
        session.add(new_user)
        session.commit()

        # Return message
        return 201, f"User with username: {username} was created successfully"

    except IntegrityError as e:
        session.rollback()

        # Check for duplicate email or username in the error message
        if 'email' in str(e.orig):
            error_message = 'Email already exists'
        elif 'username' in str(e.orig):
            error_message = 'Username already exists'
        else:
            error_message = 'Duplicate entry'

        return 409, error_message

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
    