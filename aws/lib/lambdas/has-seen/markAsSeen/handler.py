import json
import has_seen as hasSeenPY
from utils import create_response

def markAsSeen(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userID = body.get('userID')
        postIDs = body.get('postIDs')

        # Check for missing, required values
        if not userID or not postIDs:
            return create_response(400, 'Missing required fields to mark post(s) as seen. Required fields: userID & postIDs')
        
        # Call another function to mark as seen
        status_code, message = hasSeenPY.markAsSeen(userID, postIDs)

        # Return message
        return create_response(status_code, message)
        
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error marking as seen: {str(e)}")