from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')

        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call another function to get the posts
        status_code, message = resetSeenPosts(user_id)

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error resetting seen posts: {str(e)}")
    

def resetSeenPosts(userID):
    # Try to reset seen posts by userID
    try:
        # Create the session
        session = create_session()

        # Check if the userID exists
        user = session.query(User).filter_by(userID=userID).first()
        if not user:
            raise Exception("404", f"User with userID: {userID} was not found")
        
        # Delete all seen posts for the user
        deleted_rows = session.query(HasSeen).filter_by(userID=userID).delete()

        if deleted_rows == 0:
            return 404, f"No posts have been seen by user with userID: {userID}"
        else:
            # Commit the result
            session.commit()
            return 200, f"Successfully reset seen posts for user with userID: {userID}"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "ResetSeenPostsByUserID Handler.py")
        return code, msg
    
    finally:
        if 'session' in locals() and session:
            session.close()