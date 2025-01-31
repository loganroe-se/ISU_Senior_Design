from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy import select
from datetime import datetime, date

def handler(event, context):
    try:
        # Parse the user data from event
        path_params = event.get('pathParameters') or {}

        post_id = path_params.get('id')

        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to create the user
        status_code, message = getPostById(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")
    

def getPostById(post_id):
    # Try to get the post
    try:
        # Create the session
        session = create_session()

        # Fetch post that matches id
        post = (
            session.execute(select(Post).where(Post.postID == post_id))
            .scalars()
            .first()
        )

        if post:
            # Convert post to dictionary or JSON-friendly format
            post_data = {
                "postID": post.postID,
                "userID": post.userID,
                "caption": post.caption,
                "createdDate": (
                    post.createdDate.isoformat()
                    if isinstance(post.createdDate, (datetime, date))
                    else post.createdDate
                ),
                "images": [
                    {"imageID": image.imageID, "imageURL": image.imageURL}
                    for image in post.images
                ],
            }

            return 200, post_data
        else:
            return 404, f"Post with postID: {post_id} was not found"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()