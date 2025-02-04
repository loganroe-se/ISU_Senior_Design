import json
from sqlalchemy import select
from image import save_image_to_db
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from datetime import date, datetime


# This just updates the caption, this wasn't really implemented anywhere 
# so going to ask team if we need this

def updatePost(post_id, caption, created_date):
    
    try:
        # Create the session
        session = create_session()

        # Fetch the post
        post = (
            session.execute(select(Post).where(Post.postID == post_id))
            .scalars()
            .first()
        )

        if post:
            # Update post information
            if caption:
                post.caption = caption
            if created_date:
                post.createdDate = created_date

            session.commit()

            return 200, f"Post with postID: {post_id} was updated successfully"
        else:
            return 404, f"Post with postID: {post_id} was not found"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()