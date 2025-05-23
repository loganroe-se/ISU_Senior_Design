import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Post, Like
from datetime import datetime, date

def handler(event, context):
    try:
        search_string = event['pathParameters'].get('searchString')
        email = event['requestContext']['authorizer']['claims']['email']

        if not search_string:
            return create_response(400, 'Missing searchString')

        status_code, message = searchPosts(search_string, email)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error searching posts: {str(e)}")


@session_handler
def searchPosts(session, search_string, email):
    try:
        user = get_user_by_email(session, email)
        userID = user.userID

        # Get up to 20 posts matching the search string
        posts = session.execute(
            select(Post)
            .filter(
                Post.caption.ilike(f"%{search_string}%"),
                Post.status == "PUBLIC",
                Post.userID != userID,
            )
            .limit(20)
        ).scalars().all()

        posts_list = [
            {
                "postID": post.postID,
                "uuid": post.userRel.uuid if post.userRel else None,
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
                "userHasLiked": int(userID) in {like.userID for like in post.likes},
                "userHasSaved": int(userID) in {bookmark.userID for bookmark in post.bookmarks},
                "user": {
                    "username": post.userRel.username,
                    "profilePic": post.userRel.profilePicURL,
                },
            }
            for post in posts
        ]

        return 200, posts_list

    except Exception as e:
        return handle_exception(e, "Error accessing database")

