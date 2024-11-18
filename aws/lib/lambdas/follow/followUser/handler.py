import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import User, Follow
from response_utils import create_response

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
        return create_response(500, 'Error retrieving database credentials')
    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        followerID = body.get('followerID')
        followedID  = body.get('followedID')

        if not followerID or not followedID:
            return create_response(400, 'Missing required field')
        
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
            return create_response(201, f'user {followerID} successfully followed {followedID}')
        finally:
            session.close()
    
    except Exception as e:
        return create_response(500, f"Error Following: {str(e)}")
