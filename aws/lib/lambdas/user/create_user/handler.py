import os
import json
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import User

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def create_user(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        if not username or not email or not password:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required field')
            }

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        
        # Create a new user
        new_user = User(username=username, email=email, password=password)

        # Add the user to the db
        session.add(new_user)
        session.commit()
        session.close()

        # Return message
        return {
            'statusCode': 201,
            'body': json.dumps(f'User {username} created successfully')
        }
    
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Database error: {str(e)}")
        }