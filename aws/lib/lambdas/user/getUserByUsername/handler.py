import user as userPY
from utils import create_response

def getUserByUsername(event, context):
    try:
        # Get id from path parameters
        username = event['pathParameters'].get('username')
        
        # Check for missing, required values
        if not username:
            return create_response(400, 'Missing username')
        
        # Call another function to get the post
        status_code, message = userPY.getUserByUsername(username)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")