import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import User
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def signIn(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    session = None
    
    # Check credentials
    if not creds:
        return create_response(500,'Error retrieving database credentials')
    
    try:
        # Parse the login data from event
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')

        if not email or not password:
             return create_response(400,'Missing email or password')

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Query the user by email
        user = session.execute(select(User).where(User.email == email)).scalars().first()

        if user and user.password == password:  # Check hashed password
            return create_response(200,{
                    'message': f'User {user.username} signed in successfully',
                    'id': user.userID
                })
        else:
            return create_response(401,'Invalid email or password')

    except Exception as e:
        return create_response(500,f"Error Signing In: {str(e)}")
    
    finally:
        if session:
            session.close()
