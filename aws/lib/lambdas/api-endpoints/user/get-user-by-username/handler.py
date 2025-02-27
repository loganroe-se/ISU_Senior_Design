from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Get id from path parameters
        username = event['pathParameters'].get('username')
        
        # Check for missing, required values
        if not username:
            return create_response(400, 'Missing username')
        
        # Call another function to get the post
        status_code, message = getUserByUsername(username)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")
    


def getUserByUsername(username):
    # Try to get the user
    try:
        # Create the session
        session = create_session()

        # Fetch user
        user = session.execute(select(User).where(User.username == username)).scalars().first()

        if user:
            # Convert user to dictionary or JSON-friendly format
            user_data = {
                'id': user.userID,
                'username': user.username,
                'email': user.email,
                'profilePic': user.profilePicURL,
                'dob': user.dob.isoformat(),
                'accountType': user.accountType
            }

            return 200, user_data
        else:
            return 404, f'User with username: {username} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()