import os
import json
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Tag
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def updateTag(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return create_response(500,'Error retrieving database credentials')
    
    try:
        # Parse the tag ID from event
        tag_id = event['pathParameters'].get('id')
        
        if not tag_id:
            return create_response(400,'Missing tag ID')

        # Parse the updated tag data from event
        body = json.loads(event['body'])
        tagVal = body.get('tag')

        if not tagVal:
            return create_response(400,'Missing fields to update tag')

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        
        tag = session.execute(select(Tag).where(Tag.tagID == tag_id)).scalars().first()

        if tag:
            # Update tag information
            tag.tag = tagVal
                
            session.commit()
            return create_response(200,f'Tag with ID {tag_id} updated successfully')
    
        else:
            return create_response(404,f'Tag with ID {tag_id} not found')
        
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500,f"Error updating tag: {str(e)}")
    
    
    finally:
        if 'session' in locals():
            session.close()
