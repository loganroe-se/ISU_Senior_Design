import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Parse the user ID from event
        user_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')

        # Parse the update data from the body
        body = json.loads(event['body'])

        # Get all body attributes
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        # Check for missing, required values
        if not username and not email and not password:
            return create_response(400, 'Missing fields to update')
        
        # Ensure that a value is given to any variables that were not assigned
        if not username:
            username = ""
        if not email:
            email = ""
        if not password:
            password = ""

        # Call another function to get all posts
        status_code, message = updateUser(user_id, username, email, password)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    

def updateUser(user_id, username, email, password):
    # Try to update the user
    try:
        # Create the session
        session = create_session()

        # Fetch the user
        user = session.execute(select(User).where(User.userID == user_id)).scalars().first()

        if user:
            # Update user information
            if username:
                user.username = username
            if email:
                user.email = email
            if password:
                # Hash the new password before saving
                hashed_password = bcrypt.hash(password)
                user.password = hashed_password
                
            session.commit()

            return 200, f'User with userID: {user_id} was updated successfully'
        else:
            return 404, f'User with userID: {user_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()