from sqlalchemy import select
from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        post_id = path_params.get('id')

        if not post_id:
            return create_response(400, 'Missing post ID')

        status_code, message = deletePost(post_id)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting post: {str(e)}")


@session_handler
def deletePost(session, post_id):
    try:
        post = session.execute(
            select(Post).where(Post.postID == post_id)
        ).scalars().first()

        if not post:
            return 404, f"Post with postID: {post_id} was not found"

        session.delete(post)
        return 200, f"Post with postID: {post_id} was deleted successfully"

    except Exception as e:
        return handle_exception(e, "Error accessing database")
