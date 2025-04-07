from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy import select
from datetime import datetime, date

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        post_id = path_params.get('id')

        if not post_id:
            return create_response(400, 'Missing post ID')

        status_code, message = getPostById(post_id)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting post: {str(e)}")


@session_handler
def getPostById(session, post_id):
    try:
        post = session.execute(
            select(Post).where(Post.postID == post_id)
        ).scalars().first()

        if not post:
            return 404, f"Post with postID: {post_id} was not found"

        post_data = {
            "postID": post.postID,
            "userID": post.userID,
            "caption": post.caption,
            "createdDate": (
                post.createdDate.isoformat()
                if isinstance(post.createdDate, (datetime, date))
                else str(post.createdDate)
            ),
            "images": [
                {"imageID": image.imageID, "imageURL": image.imageURL}
                for image in post.images
            ],
            "numLikes": len(post.likes),
            "numComments": len(post.comments),
        }

        return 200, post_data

    except Exception as e:
        return handle_exception(e, "Error accessing database")
