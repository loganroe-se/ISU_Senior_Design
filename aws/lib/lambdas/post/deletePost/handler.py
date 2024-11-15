import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Post
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def deletePost(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:

        # Get id from path parameters
        post_id = event['pathParameters'].get('id')
        
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Fetch posts that matches the id
            post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

            if post:
                session.delete(post)
                session.commit()
                return create_response(200, f'Post with ID {post_id} deleted')
            
            else:
                return create_response(404, f'Post with ID {post_id} not found')
    
        finally:
            session.close()
    
    except Exception as e:
        return create_response(500, f"Error deleting post: {str(e)}")