import user as userPY
from utils import create_response

def getUserById(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call another function to get the post
        status_code, message = userPY.getUserById(user_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")