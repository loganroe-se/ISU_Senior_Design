from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Post


def handler(event, context):
    try:
        # Get id from path parameters
        post_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post id')
        
        # Call another function to get the post
        status_code, message = publish_post(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error publishing post: {str(e)}")
    
def publish_post(post_id):
    try:
        # Create the session
        session = create_session()

        # Fetch post
        post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

        if post:
            post.status = 'public'
            session.commit()
            return 200, f'Post with postID: {post_id} has been published'
        else:
            return 404, f'Post with postID: {post_id} not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()