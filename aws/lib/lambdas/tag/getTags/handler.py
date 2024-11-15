import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Tag
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def getTags(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:
        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Fetch all tags
        tags = session.execute(select(Tag)).scalars().all()  # Get a list of tag objects

        # Convert tags to dictionary or JSON-friendly format
        tags_data = [{
            'tagID': tag.tagID,
            'tag': tag.tag
        } for tag in tags]
        
        # Return message
        return create_response(200, tags_data)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error retrieving tags: {str(e)}")
    
    finally:
        if 'session' in locals():
            session.close()
