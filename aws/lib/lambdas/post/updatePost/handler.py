import json
import post as postPY
from response_utils import create_response

def updatePost(event, context):    
    try:
        # Parse the post ID from event
        post_id = event['pathParameters'].get('id')

        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')

        # Parse the update data from the body
        body = json.loads(event['body'])
        caption = body.get('caption')
        createdDate = body.get('createdDate')

        # Check for missing, required values
        if not caption and not createdDate:
            return create_response(400, 'Missing required fields to update the post')
        
        # Ensure that a value is given to any variables that were not assigned
        if not caption:
            caption = ""
        
        # Ensure that a value is given to any variables that were not assigned
        if not createdDate:
            createdDate = ""

        # Call another function to get all posts
        status_code, message = postPY.updatePost(post_id, caption, createdDate)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating post: {str(e)}")