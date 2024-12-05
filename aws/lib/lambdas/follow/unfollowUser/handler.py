import json
import follow as followPY
from utils import create_response

def unfollowUser(event, context):    
    try:
        # Parse the data from event
        body = json.loads(event['body'])

        # Get all body attributes
        followerId = body.get('followerId')
        followedId = body.get('followedId')

        # Check for missing, required values
        if not followerId or not followedId:
            return create_response(400, 'Missing required field')
        
        # Call another function to remove the follow relationship
        status_code, message = followPY.deleteFollow(followerId, followedId)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unfollowing user: {str(e)}")