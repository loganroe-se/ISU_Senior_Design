import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        search_string = event['pathParameters'].get('searchString')

        if not search_string:
            return create_response(400, 'Missing searchString')

        status_code, message = searchUsers(search_string)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")


@session_handler
def searchUsers(session, search_string):
    try:
        users = session.execute(
            select(User.username, User.userID, User.profilePicURL)
            .filter(User.username.ilike(f"%{search_string}%"))
            .limit(20)
        ).fetchall()

        users_list = [
            {
                "username": row[0],
                "userID": row[1],
                "profilePic": row[2]
            } for row in users
        ]

        return 200, users_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")
