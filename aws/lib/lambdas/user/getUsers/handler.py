import user as userPY
from response_utils import create_response

def getUsers(event, context):
    try:
        # Call another function to get all posts
        status_code, message = userPY.getUsers()

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving users: {str(e)}")