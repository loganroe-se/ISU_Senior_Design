import post as postPY
from utils import create_response

def deletePost(event, context):
    try:
        # Get id from path parameters
        post_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to delete the post
        status_code, message = postPY.deletePost(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error deleting post: {str(e)}")