import json
import user as userPY
from response_utils import create_response

def updateUser(event, context):
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
        status_code, message = userPY.updateUser(user_id, username, email, password)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")