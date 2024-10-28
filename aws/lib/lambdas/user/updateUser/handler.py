import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import User

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def updateUser(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:

        # Parse the user ID from event
        user_id = event['pathParameters'].get('id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing user ID')
            }

        # Parse the update data from the body
        body = json.loads(event['body'])
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        if not username and not email and not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing fields to update')
            }

        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
            
            user = session.execute(select(User).where(User.userID == user_id)) 

            if user:
                # Update user information
                if username:
                    user.username = username
                if email:
                    user.email = email
                if email:
                    user.password = password
                    
                session.commit()

                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps(f'User {user_id} updated successfully')
                }
        
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps(f'User with ID {user_id} not found')
                }
            
        finally:
            session.close()
        
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(f"Error updating user: {str(e)}")
        }