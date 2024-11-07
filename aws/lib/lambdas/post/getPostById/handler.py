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

def getPostById(event, context):
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
        post_id = event['pathParameters'].get('id')
        
        if not post_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing post ID')
            }
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Fetch post that matches id
            post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

            if post:
                    # Convert post to dictionary or JSON-friendly format
                    post_data = {
                        'postID' : post.postID,
                        'userID': post.userID,
                        'caption': post.caption,
                        'createdDate': (post.createdDate.isoformat() if isinstance(post.createdDate, (datetime, date))
                        else post.createdDate)
                    }

                    return {
                        'statusCode': 200,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type'
                        },
                        'body': json.dumps(post_data)
                    }
            else:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type'
                        },
                        'body': json.dumps(f'Post with ID {post_id} not found')
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
            'body': json.dumps(f"Error retrieving post: {str(e)}")
        }