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

def getFollowersById(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:

        # Get id from path parameters
        user_id = event['pathParameters'].get('id')
        
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Fetch followers
            follower_result = session.execute(select(Follow).where(Follow.followedID == user_id)).scalars().all()

            follower_list = [{'followID': follower.followID, 'followerID': follower.followerID, 'followedID': follower.followedID} for follower in follower_result]
        
            # Return message
            return create_response(200, follower_list)
            
        finally:
            session.close()
    
    except Exception as e:
        return create_response(500, f"Error retrieving following list: {str(e)}")