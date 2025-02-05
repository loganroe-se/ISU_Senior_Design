import json, datetime
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userID = body.get('userID')
        postIDs = body.get('postIDs')

        # Check for missing, required values
        if not userID or not postIDs:
            return create_response(400, 'Missing required fields to mark post(s) as seen. Required fields: userID & postIDs')
        
        # Call another function to mark as seen
        status_code, message = markAsSeen(userID, postIDs)

        # Return message
        return create_response(status_code, message)
        
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error marking as seen: {str(e)}")
    

def markAsSeen(userID, postIDs):
    # Try to mark the posts as seen
    try:
        # Create the session
        session = create_session()

        # Check if the userID exists
        user = session.query(User).filter_by(userID=userID).first()
        if not user:
            raise Exception("404", f"User with userID: {userID} was not found")
        
        # Check if the postID(s) exist
        posts = session.query(Post).filter(Post.postID.in_(postIDs)).all()
        valid_postIDs = {post.postID for post in posts}

        # Filter out the invalid postIDs
        invalid_postIDs = set(postIDs) - valid_postIDs
        if invalid_postIDs:
            raise Exception(404, f"Invalid postIDs: {', '.join(map(str, invalid_postIDs))}")
        
        # Mark the valid posts as seen
        for postID in valid_postIDs:
            session.add(HasSeen(userID=userID, postID=postID, timeViewed=datetime.now()))

        # Commit the changes
        session.commit()

        return 200, f"Posts marked as seen succesfully for the user with userID: {userID}"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Has_Seen.py")
        return code, msg
    
    finally:
        if 'sesion' in locals() and session:
            session.close()