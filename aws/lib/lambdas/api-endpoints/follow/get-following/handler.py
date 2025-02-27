from utils import create_response, handle_exception
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')
        
        # Check for missing required value
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call getFollowers function to get followers from the database
        status_code, message = getFollowing(user_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving following list: {str(e)}")
    

def getFollowing(user_id):
    # Try to get list of all users who user_id follows
    try:
        # Create the session
        session = create_session()

        # Fetch the user by ID
        user = session.query(User).filter(User.userID == user_id).one_or_none()

        # If user does not exist, return 404
        if not user:
            return 404, f"User with ID {user_id} does not exist."

        # Get all users that the current user is following
        following = [
            {
                "userID": follow.followed.userID,
                "username": follow.followed.username,
            }
            for follow in user.following
        ]

        # Return the list of following users
        return 200, following

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()