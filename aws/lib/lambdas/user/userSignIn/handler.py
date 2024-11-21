import json
import user as userPY
from utils import create_response

def signIn(event, context):
    try:
        # Parse the login data from event
        body = json.loads(event['body'])

        # Get all body attributes
        email = body.get('email')
        password = body.get('password')

        # Check for missing, required values
        if not email or not password:
             return create_response(400, 'Missing email or password')

        # Call another function to get all posts
        status_code, message = userPY.signIn(email, password)

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error Signing In: {str(e)}")
