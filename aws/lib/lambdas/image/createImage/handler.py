import os
import json
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Image
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def createImage(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:
        # Parse the image data from event
        body = json.loads(event['body'])
        postID = body.get('postID')
        imageURL = body.get('imageURL')

        if not imageURL:
            return create_response(400, 'Missing required field in image creation')

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        
        # Create a new image
        new_image = Image(postID=postID, imageURL=imageURL)

        # Add the image to the db
        session.add(new_image)
        session.commit()

        # Return message
        return create_response(201, f'Image with postID: {postID} was created successfully')
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating image: {str(e)}")
    
    finally:
        if 'session' in locals():
            session.close()