import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import User
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def getUserByUsername(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:

        # Get id from path parameters
        username = event['pathParameters'].get('username')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing username')
            }
            return create_response(400, 'Missing username')
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Fetch user
            user = session.execute(select(User).where(User.username == username)).scalars().first()

            if user:
                    # Convert user to dictionary or JSON-friendly format
                    user_data = {
                        'id': user.userID,
                        'username': user.username,
                        'email': user.email
                    }

                    return create_response(200, user_data)
            else:
                    return create_response(404, f'User with username: {username} not found')
            
        finally:
            session.close()
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")