import os
import json
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Post

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def create_post(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        postID = body.get('postID')
        #userID = body.get('userID')
        caption  = body.get('caption')
        createdDate = body.get('createdDate')
        imageURL = body.get('imageURL')

        if not caption or not imageURL:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required field')
            }

        # Initialize SQLAlchemy engine and session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        
        # Create a new user
        new_post = Post(postID=postID, caption=caption, createdDate=createdDate, imageURL=imageURL)

        # Add the user to the db
        session.add(new_post)
        session.commit()
        session.close()

        # Return message
        return {
            'statusCode': 201,
            'body': json.dumps(f'Post {postID} created successfully')
        }
    
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Database error: {str(e)}")
        }
