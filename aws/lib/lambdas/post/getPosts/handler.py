import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Post
from datetime import datetime, date

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def getPosts(event, context):
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
        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Fetch all posts
        posts_result = session.execute(select(Post)).scalars().all()  # Get a list of user objects

        # Create a list of post dictionaries directly
        posts_list = [{'postID': post.postID, 'userID': post.userID, 'caption': post.caption, 'createdDate': (
            post.createdDate.isoformat() if isinstance(post.createdDate, (datetime, date))
            else post.createdDate)} for post in posts_result]
        
        # Return message
        return {
            'statusCode': 200,  # Changed to 200 for a successful retrieval
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(posts_list)  # Serialize the list of users
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(f"Error retrieving posts: {str(e)}")
        }
    
    finally:
        session.close()