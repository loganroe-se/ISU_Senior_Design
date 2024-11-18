import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Post
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def updatePost(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:

        # Parse the post ID from event
        post_id = event['pathParameters'].get('id')
        
        if not post_id:
            return create_response(400, 'Missing post ID')

        # Parse the update data from the body
        body = json.loads(event['body'])
        caption = body.get('caption')
        createdDate = body.get('createdDate')
        imageURL = body.get('imageURL')

        if not caption and not imageURL and not createdDate:
            return create_response(400, 'Missing fields to update')

        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
            
            post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

            if post:
                # Update post information
                if caption:
                    post.caption = caption
                if createdDate:
                    post.createdDate = createdDate
                if imageURL:
                    post.imageURL = imageURL
                session.commit()
                return create_response(200, f'Post {post_id} updated successfully')
        
            else:
                return create_response(404, f'Post with ID {post_id} not found')
            
        finally:
            session.close()
        
    
    except Exception as e:
        return create_response(500, f"Error updating post: {str(e)}")