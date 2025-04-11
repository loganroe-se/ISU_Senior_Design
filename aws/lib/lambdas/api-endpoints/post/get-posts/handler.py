from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy.orm import joinedload
from datetime import datetime, date

def handler(event, context):
    try:
        status_code, message = getPosts()
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")


@session_handler
def getPosts(session):
    try:
        posts_result = (
            session.query(Post)
            .options(joinedload(Post.images), joinedload(Post.likes), joinedload(Post.comments))
            .all()
        )

        posts_list = [
            {
                "postID": post.postID,
                "uuid": post.userRel.uuid,
                "status": post.status,
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
            for post in posts_result
        ]

        return 200, posts_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")
