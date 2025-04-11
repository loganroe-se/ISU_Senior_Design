import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Post, User
from datetime import datetime, date

def handler(event, context):
    try:
        search_string = event['pathParameters'].get('searchString')

        if not search_string:
            return create_response(400, 'Missing searchString')

        status_code, message = searchPosts(search_string)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error searching posts: {str(e)}")


@session_handler
def searchPosts(session, search_string):
    try:
        posts = session.execute(
            select(Post)
            .filter(Post.caption.ilike(f"%{search_string}%"))
            .limit(20)
        ).scalars().all()

        posts_list = [
            {
                "postID": post.postID,
                "uuid": post.user.uuid if post.user else None,
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
            for post in posts
        ]

        return 200, posts_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")
