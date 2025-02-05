import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Like, User, Post

def handler(event, context):
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userId = body.get('userId')
        postId = body.get('postId')

        # Check for missing required values
        if not userId or not postId:
            return create_response(400, 'Missing required field')
        
        # Call function to create like
        status_code, message = createLike(userId, postId)

        # Return response
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating like: {str(e)}")

def createLike(userId, postId):
    try:
        # Create session
        session = create_session()

        # Check if the user and post exist
        user_exists = session.execute(select(User).where(User.userID == userId)).scalars().first()
        post_exists = session.execute(select(Post).where(Post.postID == postId)).scalars().first()

        if not user_exists or not post_exists:
            return 404, "User or post does not exist."

        # Check if the like already exists
        existing_like = session.execute(select(Like).where(and_(Like.userId == userId, Like.postId == postId))).scalars().first()
        if existing_like:
            return 409, "Duplicate like entry: The like already exists."

        # Create new like relationship
        new_like = Like(userId=userId, postId=postId)

        # Add like to database
        session.add(new_like)
        session.commit()

        # Successful return message
        return 201, f"User {userId} liked post {postId} successfully."
    
    except Exception as e:
        # Handle exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
