import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Like

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
        
        # Call function to remove the like
        status_code, message = deleteLike(userId, postId)

        # Return response
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unliking post: {str(e)}")
    

def deleteLike(userId, postId):
    try:
        # Create session
        session = create_session()

        # Fetch like relationship
        like = session.execute(select(Like).where((Like.userID == userId) & (Like.postID == postId))).scalars().first()

        if like:
            session.delete(like)
            session.commit()
            return 200, "Like was removed successfully."
        else:
            return 404, "Like was not found."

    except Exception as e:
        # Handle exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
