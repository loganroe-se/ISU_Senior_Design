import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Image

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def updateImage(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Parse the image ID from event
        image_id = event['pathParameters'].get('id')
        
        if not image_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing image ID')
            }

        # Parse the updated image data from event
        body = json.loads(event['body'])
        postID = body.get('postID')
        tagID = body.get('tagID')
        imageURL = body.get('imageURL')

        if not imageURL:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required field to update image')
            }

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        
        image = session.execute(select(Image).where(Image.imageID == image_id)) 

        if image:
            # Update image information
            if postID:
               image.postID = postID
            if tagID:
                image.tagID = tagID
            if imageURL:
                image.imageURL = imageURL
                
            session.commit()

            return {
                'statusCode': 200,
                'body': json.dumps(f'Image with ID {image_id} updated successfully')
            }
    
        else:
            return {
                'statusCode': 404,
                'body': json.dumps(f'Image with ID {image_id} not found')
            }
        
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating image: {str(e)}")
        }
    
    finally:
        if 'session' in locals():
            session.close()
