import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Post
from datetime import datetime, date
from response_utils import create_response

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
        return create_response(500,'Error retrieving database credentials')
    
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
        return create_response(200,posts_list)
    
    except Exception as e:
        return create_response(500,f"Error retrieving posts: {str(e)}")
    
    finally:
        session.close()