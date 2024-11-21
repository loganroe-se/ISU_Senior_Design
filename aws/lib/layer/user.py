from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import User

# Functions in this file meant to be used elsewhere:
# createUser(username, email, password)
# deleteUser(user_id)
# getUserById(user_id)
# getUserByUsername(username)
# getUsers()
# updateUser(user_id, username, email, password)
# userSignIn(email, password)

def createUser(username, email, password):
    # Try to create the user
    try:
        # Create the session
        session = create_session()

        # Create a new user
        new_user = User(username=username, email=email, password=password)

        # Add the user to the db
        session.add(new_user)
        session.commit()

        # Return message
        return 201, f"User with username: {username} was created successfully"

    except IntegrityError as e:
        session.rollback()

        # Check for duplicate email or username in the error message
        if 'email' in str(e.orig):
            error_message = 'Email already exists'
        elif 'username' in str(e.orig):
            error_message = 'Username already exists'
        else:
            error_message = 'Duplicate entry'

        return 409, error_message

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def deleteUser(user_id):
    # Try to delete the user
    try:
        # Create the session
        session = create_session()

        # Fetch all users
        user = session.execute(select(User).where(User.userID == user_id)).scalars().first()

        if user:
            session.delete(user)
            session.commit()

            return 200, f'User with userID: {user_id} was deleted successfully'
        else:
            return 404, f'User with userID: {user_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getUserById(user_id):
    # Try to get the user
    try:
        # Create the session
        session = create_session()

        # Fetch user
        user = session.execute(select(User).where(User.userID == user_id)).scalars().first()

        if user:
            # Convert user to dictionary or JSON-friendly format
            user_data = {
                'id': user.userID,
                'username': user.username,
                'email': user.email
            }
            return 200, user_data
        else:
            return 404, f'User with userID: {user_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


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
                'email': user.email
            }

            return 200, user_data
        else:
            return 404, f'User with username: {username} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


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
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


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
                user.password = password
                
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


def signIn(email, password):
    # Try to sign in
    try:
        # Create the session
        session = create_session()

        # Query the user by email
        user = session.execute(select(User).where(User.email == email)).scalars().first()

        if user and user.password == password:  # Check hashed password
            return 200, {
                    'message': f'User with username: {user.username} was signed in successfully',
                    'id': user.userID
                }
        else:
            return 401, 'Invalid email or password'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "User.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()