import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import User, Follow

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def followUser(event, context):
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
        # Parse the user data from event
        body = json.loads(event['body'])
        followerID = body.get('followerID')
        followedID  = body.get('followedID')

        if not followerID or not followedID:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required field')
            }
        
        try:

            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
            
            # Create a new follow
            new_follow = Follow(followerID=followerID, followedID=followedID)

            # Add the user to the db
            session.add(new_follow)
            session.commit()
            session.close()

            # Return message
            return {
                'statusCode': 201,
                'body': json.dumps(f'user {followerID} successfully followed {followedID}')
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
            'body': json.dumps(f"Error Following: {str(e)}")
        }
