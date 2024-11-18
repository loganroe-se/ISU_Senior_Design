import os
import json
from datetime import date
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Post, User
from response_utils import create_response

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
        return create_response(500,'Error retrieving database credentials')
    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        userID = body.get('userID')
        caption  = body.get('caption')

        if not userID:
            return create_response(400,'Missing required field')
        
        try:

            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
            
            # Verify if userID exists in the User table
            user_exists = session.query(User).filter_by(userID=userID).first()

            if not user_exists:
                return create_response(404,'User does not exist')

            # Auto-fill createdDate with current time
            createdDate = date.today()

            # Create a new post
            new_post = Post(userID=userID, caption=caption, createdDate=createdDate)

            # Add the post to the db
            session.add(new_post)
            session.commit()

            # Return message
            return create_response(201,f'Post by user {userID} created successfully')
        finally:
            session.close()
    
    except Exception as e:
        return create_response(500,f"Error Creating Post: {str(e)}")
