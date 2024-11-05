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

def getImages(event, context):
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

        # Fetch all images
        images = session.execute(select(Image)).scalars().all()  # Get a list of image objects

        # Convert images to dictionary or JSON-friendly format
        images_data = [{
            'imageID': image.imageID,
            'postID': image.postID,
            'imageURL': image.imageURL
        } for image in images]
        
        # Return message
        return {
            'statusCode': 200,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(images_data)
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(f"Error retrieving images: {str(e)}")
        }
    
    finally:
        if 'session' in locals():
            session.close()
