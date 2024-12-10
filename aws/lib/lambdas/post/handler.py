import json
import post as postPY
from utils import create_response

def handler(event, context):
    try:
        # Determine the HTTP method and resource path
        http_method = event.get('httpMethod')
        resource_path = event.get('resource')
        
        # Parse the request body and parameters
        body = event.get('body', None)
        if body is not None:
            body = json.loads(body)

        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}

        # Route requests based on the method and resource
        if http_method == 'POST':
            # Create a post
            userID = body.get('userID')
            caption = body.get('caption', "")
            images = body.get('images')
            if not userID:
                return create_response(400, 'Missing required field: userID')
            status_code, message = postPY.createPost(userID, caption, images)
        
        elif http_method == 'DELETE':
            # Delete a post
            post_id = path_params.get('id')
            if not post_id:
                return create_response(400, 'Missing post ID')
            status_code, message = postPY.deletePost(post_id)
        
        elif http_method == 'GET':
            if 'id' in path_params:
                # Get post by ID
                post_id = path_params.get('id')
                if not post_id:
                    return create_response(400, 'Missing post ID')
                status_code, message = postPY.getPostById(post_id)
            else:
                # Get all posts
                status_code, message = postPY.getPosts()
        
        elif http_method == 'PUT':
            # Update a post
            post_id = path_params.get('id')
            if not post_id:
                return create_response(400, 'Missing post ID')
            caption = body.get('caption', "")
            createdDate = body.get('createdDate', "")
            if not caption and not createdDate:
                return create_response(400, 'Missing fields to update the post')
            status_code, message = postPY.updatePost(post_id, caption, createdDate)
        
        else:
            return create_response(404, 'Resource not found')
        
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Internal server error: {str(e)}")
