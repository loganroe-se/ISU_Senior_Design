import json
import follow as followPY
from utils import create_response

def followUser(event, context):
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        followerId = body.get('followerId')
        followedId = body.get('followedId')

        # Check for missing, required values
        if not followerId or not followedId:
            return create_response(400, 'Missing required field')
        
        # Call another function to create the post
        status_code, message = followPY.createFollow(followerId, followedId)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating follow relationship: {str(e)}")
