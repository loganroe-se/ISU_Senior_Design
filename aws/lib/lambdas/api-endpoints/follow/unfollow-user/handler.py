import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Follow

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
        
        # Call another function to remove the follow relationship
        status_code, message = deleteFollow(followerId, followedId)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unfollowing user: {str(e)}")
    

def deleteFollow(followerId, followedId):
    # Try to delete the following relationship
    try:
        # Create the session
        session = create_session()

        # Fetch follow relationship
        follow = session.execute(select(Follow).where(and_(Follow.followerId == followerId, Follow.followedId == followedId))).scalars().first()

        if follow:
            session.delete(follow)
            session.commit()

            return 200, f'Follow relationship was deleted successfully'
        else:
            return 404, f'Follow relationship was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "follow.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()