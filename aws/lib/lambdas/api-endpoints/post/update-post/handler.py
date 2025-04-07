from sqlalchemy import select
from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post


@session_handler
def updatePost(session, post_id, caption, created_date):
    try:
        post = session.execute(
            select(Post).where(Post.postID == post_id)
        ).scalars().first()

        if not post:
            return 404, f"Post with postID: {post_id} was not found"

        if caption:
            post.caption = caption
        if created_date:
            post.createdDate = created_date

        return 200, f"Post with postID: {post_id} was updated successfully"

    except Exception as e:
        return handle_exception(e, "Post.py")
