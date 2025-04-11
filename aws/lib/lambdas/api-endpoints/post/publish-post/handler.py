from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Post

def handler(event, context):
    try:
        post_id = event['pathParameters'].get('id')

        if not post_id:
            return create_response(400, 'Missing post id')

        status_code, message = publish_post(post_id)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error publishing post: {str(e)}")


@session_handler
def publish_post(session, post_id):
    try:
        post = session.execute(
            select(Post).where(Post.postID == post_id)
        ).scalars().first()

        if not post:
            return 404, f'Post with postID: {post_id} not found'

        post.status = 'public'
        return 200, f'Post with postID: {post_id} has been published'

    except Exception as e:
        return handle_exception(e, "Error accessing database")
