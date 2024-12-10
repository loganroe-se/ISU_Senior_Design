import json
import has_seen as hasSeenPY
from utils import create_response

def handler(event):
    try:
        # Determine the HTTP method nad resource path
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
            # Mark post(s) as seen
            userID = body.get('userID')
            postIDs = body.get('postIDs')

            # Ensure required fields exist
            if not userID or not postIDs:
                return create_response(400, 'Missing required fields to mark post(s) as seen. Required fields: userID & postIDs')
            
            # Call the backend method
            status_code, message = hasSeenPY.markAsSeen(userID, postIDs)
        
        elif http_method == 'GET':
            if resource_path == '/seenPosts':
                # Get seen posts by userID
                userID = path_params.get('userID')
                if not userID:
                    return create_response(400, 'Missing required field: userID')
                
                # Call the backend method
                status_code, message = hasSeenPY.getSeenPosts(int(userID))

            elif resource_path == '/seenUsers':
                # Get users who have seen the post
                postID = path_params.get('postID')
                if not postID:
                    return create_response(400, 'Missing required field: postID')
                
                # Call the backend method
                status_code, message = hasSeenPY.getUsers(postID)

        else:
            return create_response(404, 'Resource not found')
        
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Internal server error: {str(e)}")