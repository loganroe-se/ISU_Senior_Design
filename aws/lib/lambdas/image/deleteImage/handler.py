import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Image
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def deleteImage(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:
        # Get id from path parameters
        image_id = event['pathParameters'].get('id')
        
        if not image_id:
            return create_response(400, 'Missing image ID')
        
        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Fetch the image
        image = session.execute(select(Image).where(Image.imageID == image_id)).scalars().first()

        if image:
            session.delete(image)
            session.commit()

            return create_response(200, f'Image with ID {image_id} deleted')
        
        else:
            return create_response(404, f'Image with ID {image_id} not found')
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting image: {str(e)}")
    
    finally:
        if 'session' in locals():
            session.close()
