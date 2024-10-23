import os
import json
from sqlalchemy import select

from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import User

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def get_users(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        
        # Fetch all users
        users_result = session.execute(select(User)).scalars().all()  # Get a list of user objects
        session.close()

        # Create a list of user dictionaries directly
        users_list = [{'username': user.username, 'email': user.email} for user in users_result]
        
        # Return message
        return {
            'statusCode': 200,  # Changed to 200 for a successful retrieval
            'body': json.dumps(users_list)  # Serialize the list of users
        }
    
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving users: {str(e)}")
        }