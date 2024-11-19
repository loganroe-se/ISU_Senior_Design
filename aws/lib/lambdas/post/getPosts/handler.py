import post as postPY
from response_utils import create_response

def getPosts(event, context):    
    try:
        # Call another function to get all posts
        status_code, message = postPY.getPosts()

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving posts: {str(e)}")