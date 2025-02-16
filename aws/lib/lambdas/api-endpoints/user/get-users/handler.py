from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Call another function to get all users
        status_code, message = getUsers()

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving users: {str(e)}")
    

def getUsers():
    # Try to get all users
    try:
        # Create the session
        session = create_session()

        # Fetch all users
        users_result = session.execute(select(User)).scalars().all()  # Get a list of user objects

        # Create a list of user dictionaries directly
        users_list = [{'username': user.username, 'email': user.email, 'id': user.userID} for user in users_result]
        
        # Return message
        return 200, users_list

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()