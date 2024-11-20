import json
import post as postPY
from response_utils import create_response

def createPost(event, context):    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userID = body.get('userID')
        caption = body.get('caption')

        # Check for missing, required values
        if not userID:
            return create_response(400, 'Missing required field')
        
        # Ensure that a value is given to any variables that were not assigned
        if not caption:
            caption = ""
        
        # Call another function to create the post
        status_code, message = postPY.createPost(userID, caption)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")
