import os
import json
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Post

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def createPost(event, context):
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
        # Parse the user data from event
        body = json.loads(event['body'])
        userID = body.get('userID')
        caption  = body.get('caption')
        createdDate = body.get('createdDate')

        if not caption:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required field')
            }
        
        try:

            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
            
            # Create a new user
            new_post = Post(userID=userID, caption=caption, createdDate=createdDate)

            # Add the user to the db
            session.add(new_post)
            session.commit()
            session.close()

            # Return message
            return {
                'statusCode': 201,
                'body': json.dumps(f'Post by user {userID} created successfully')
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
            'body': json.dumps(f"Error Creating Post: {str(e)}")
        }
