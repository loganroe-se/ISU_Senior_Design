import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Follow, User

def handler(event, context):
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        followerId = body.get('followerId')
        followedId = body.get('followedId')

        # Check for missing, required values
        if not followerId or not followedId:
            return create_response(400, 'Missing required field')
        
        # Call another function to create the post
        status_code, message = createFollow(followerId, followedId)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating follow relationship: {str(e)}")
    
def createFollow(followerId, followedId):
    # Try to create the follow relationship
    try:
        # Create the session
        session = create_session()

        # Check if both users exist
        follower_exists = session.execute(select(User).where(User.userId == followerId)).scalars().first()
        followed_exists = session.execute(select(User).where(User.userId == followedId)).scalars().first()

        if not follower_exists or not followed_exists:
            return 404, "One or both user IDs do not exist."

        # Check if the follow relationship already exists
        existing_follow = session.execute(select(Follow).where(and_(Follow.followerId == followerId, Follow.followedId == followedId))).scalars().first()
        if existing_follow:
            return 409, "Duplicate follow entry: The follow relationship already exists."

        # Create new follow relationship
        new_follow = Follow(followedId=followedId, followerId=followerId)

        # Add follow relationship to db
        session.add(new_follow)
        session.commit()
        session.close()

        # Successful return message
        return 201, f"Follow relationship between followerId: {followerId} and followedId: {followedId} was created successfully."
    
    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
