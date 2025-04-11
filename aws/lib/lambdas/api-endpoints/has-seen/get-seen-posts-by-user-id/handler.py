from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen
from datetime import datetime, date

def handler(event, context):
    try:
        # Get user ID from path parameters
        email = event['requestContext']['authorizer']['claims']['email']


        status_code, message = getSeenPosts(email)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting seen posts: {str(e)}")


@session_handler
def getSeenPosts(session, email):
    try:
        user = get_user_by_email(session, email)
        userID = user.userID

        if not user:
            return 404, f"User with userID: {email} was not found"

        seen_posts = session.query(Post).join(
            HasSeen, HasSeen.postID == Post.postID
        ).filter(HasSeen.userID == userID).all()

        if not seen_posts:
            return 404, f"No posts have been seen by user with email: {email}"

        seen_posts_data = [
            {
                "postID": post.postID,
                "uuid": post.userRel.uuid if post.userRel else None,
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
            }
            for post in seen_posts
        ]

        return 200, seen_posts_data

    except Exception as e:
        return handle_exception(e, "GetSeenPostsByUserID")
