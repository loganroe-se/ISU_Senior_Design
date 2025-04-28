import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import User

def handler(event, context):
    try:
        search_string = event['pathParameters'].get('searchString')
        email = event['requestContext']['authorizer']['claims']['email']

        if not search_string:
            return create_response(400, 'Missing searchString')

        status_code, message = searchUsers(search_string, email)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")


@session_handler
def searchUsers(session, search_string, email):
    try:
        user = get_user_by_email(session, email)

        users = session.execute(
            select(User.username, User.uuid, User.profilePicURL)
            .filter(
                User.username.ilike(f"%{search_string}%"),
                User.userID != user.userID,
            )
            .limit(20)
        ).fetchall()

        users_list = [
            {
                "username": row[0],
                "uuid": row[1],
                "profilePic": row[2]
            } for row in users
        ]

        return 200, users_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")
