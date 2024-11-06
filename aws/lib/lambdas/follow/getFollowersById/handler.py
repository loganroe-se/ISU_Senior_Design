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

def getFollowersById(event, context):
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

        # Get id from path parameters
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
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Fetch followers
            follower_result = session.execute(select(Follow).where(Follow.followedID == user_id)).scalars().all()

            follower_list = [{'followID': follower.followID, 'followerID': follower.followerID, 'followedID': follower.followedID} for follower in follower_result]
        
            # Return message
            return {
                'statusCode': 200,  # Changed to 200 for a successful retrieval
                'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                'body': json.dumps(follower_list)  # Serialize the list of followers
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
            'body': json.dumps(f"Error retrieving following list: {str(e)}")
        }