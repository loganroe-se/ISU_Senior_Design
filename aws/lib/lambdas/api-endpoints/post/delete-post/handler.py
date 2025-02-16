from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}

        post_id = path_params.get('id')

        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to create the user
        status_code, message = deletePost(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting post: {str(e)}")
    

def deletePost(post_id):
    # Try to delete the post
    try:
        # Create the session
        session = create_session()

        # Fetch posts that matches the id
        post = (
            session.execute(select(Post).where(Post.postID == post_id))
            .scalars()
            .first()
        )

        if post:
            session.delete(post)
            session.commit()

            return 200, f"Post with postID: {post_id} was deleted successfully"
        else:
            return 404, f"Post with postID: {post_id} was not found"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()