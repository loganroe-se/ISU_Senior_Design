import os
import json
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Tag
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def createTag(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500,'Error retrieving database credentials')
    
    try:
        # Parse the tag data from event
        body = json.loads(event['body'])
        tag = body.get('tag')

        if not tag:
            return create_response(400, 'Missing required field in tag creation')

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

        # Check if the tag already exists
        existing_tag = session.query(Tag).filter(Tag.tag.ilike(tag)).first()
        if existing_tag:
            return create_response(409, f'A tag already exists for the value {tag}, with tag ID: {existing_tag.tagID}')
        
        # Create a new tag
        new_tag = Tag(tag=tag)

        # Add the tag to the db
        session.add(new_tag)
        session.commit()

        # Return message
        return create_response(201, f'Tag with tagID: {new_tag.tagID} was created successfully')
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating tag: {str(e)}")
    
    finally:
        if 'session' in locals():
            session.close()