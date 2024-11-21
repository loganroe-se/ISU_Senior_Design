import post as postPY
from utils import create_response

def getPostsByUserId(event, context):
    try:
        # Extract userID from query string parameters
        query_params = event.get('queryStringParameters', {})
        user_id = query_params.get('userID')
        
        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing userID')
        
        # Call the function to get posts by user ID
        status_code, message = postPY.getPostsByUserId(user_id)

        # Return the result
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving posts: {str(e)}")
