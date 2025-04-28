from sqlalchemy import select
from sqlalchemy_utils import session_handler, get_user_by_email
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import NoResultFound
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, Bookmark
from datetime import datetime, date

def handler(event, context):
    try:
        email = event['requestContext']['authorizer']['claims']['email']

        status_code, message = getBookmarks(email)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting bookmarks: {str(e)}")


@session_handler
def getBookmarks(session, email):
    try:
        user = get_user_by_email(session, email)
        if not user:
            return 404, "User does not exist."
        userID = user.userID

        # Query to fetch posts bookmarked by the user
        query = (
            select(Post)
            .join(Bookmark, Bookmark.postID == Post.postID)
            .where(Bookmark.userID == user.userID)
            .options(
                joinedload(Post.images),
                joinedload(Post.likes),
                joinedload(Post.comments),
                joinedload(Post.userRel)
            )
        )

        # Execute the query and fetch results
        bookmarks_result = session.execute(query).unique().scalars().all()

        # Construct the response
        bookmarks_list = [
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
                "user": {
                    "username": post.userRel.username,
                    "profilePic": post.userRel.profilePicURL,
                },
                "userHasLiked": int(userID) in {like.userID for like in post.likes},
                "userHasSaved": int(userID) in {bookmark.userID for bookmark in post.bookmarks},
            }
            for post in bookmarks_result
        ]

        return 200, bookmarks_list

    except NoResultFound:
        return 404, f"Invalid user {email}."
    except Exception as e:
        return handle_exception(e, "Error accessing database")
