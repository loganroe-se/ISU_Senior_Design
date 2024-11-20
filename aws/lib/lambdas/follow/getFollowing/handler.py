import follow as followPY
from response_utils import create_response

def getFollowing(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')
        
        # Check for missing required value
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call getFollowers function to get followers from the database
        status_code, message = followPY.getFollowing(user_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving following list: {str(e)}")