import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Image

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def getImageByPostId(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Get id from path parameters
        post_id = event['pathParameters'].get('id')
        
        if not post_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing post ID')
            }
        
        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Fetch all images with the requested post ID
        images = session.execute(select(Image).where(Image.postID == post_id)).scalars().all()

        if images:
            # Convert images to dictionary or JSON-friendly format
            images_data = [{
                'imageID': image.imageID,
                'postID': image.postID,
                'tagID': image.tagID,
                'imageURL': image.imageURL
            } for image in images]
        
            # Return message
            return {
                'statusCode': 200,
                'body': json.dumps(images_data)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps(f'Image(s) with post ID {post_id} not found')
            }
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving image(s): {str(e)}")
        }
    
    finally:
        if 'session' in locals():
            session.close()
