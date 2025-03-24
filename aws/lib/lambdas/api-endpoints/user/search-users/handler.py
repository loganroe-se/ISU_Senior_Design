import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        # Get search string from path parameters
        search_string = event['pathParameters'].get('searchString')
        
        if not search_string:
            return create_response(400, 'Missing searchString')
        
        # Call helper function to execute the search
        status_code, message = searchUsers(search_string)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")
    


def searchUsers(search_string):
    try:
        # Create the session
        session = create_session()

        # Select the username and userID of first 20 users that match the search string
        users = session.execute(
            select(User.username, User.userID, User.profilePicURL)
            .filter(User.username.ilike(f"%{search_string}%"))
            .limit(20)
        ).fetchall()

        # Create a list of user dictionaries directly
        users_list = [{"username": row[0], "userID": row[1], "profilePic": row[2]} for row in users]

        return 200, users_list

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()