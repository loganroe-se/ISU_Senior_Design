import json
import user as userPY
from response_utils import create_response

def createUser(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        # Check for missing, required values
        if not username or not email or not password:
            return create_response(400, 'Missing required field')
        
        # Call another function to create the post
        status_code, message = userPY.createUser(username, email, password)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating user: {str(e)}")
    