import os
import json
from sqlalchemy.exc import IntegrityError
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import User
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def createUser(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')

    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        if not username or not email or not password:
            return create_response(400, 'Missing required field')
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Create a new user
            new_user = User(username=username, email=email, password=password)

            # Add the user to the db
            session.add(new_user)
            session.commit()

            # Return message
            return create_response(201, f"User {username} created successfully")
        
        finally:
            session.close()

    except IntegrityError as e:
        session.rollback()
        
        # Check for duplicate email or username in the error message
        if 'email' in str(e.orig):
            error_message = 'Email already exists'
        elif 'username' in str(e.orig):
            error_message = 'Username already exists'
        else:
            error_message = 'Duplicate entry'

        return create_response(409, error_message)
    
    except Exception as e:
        return create_response(500, f"Error Creating User: {str(e)}")
    