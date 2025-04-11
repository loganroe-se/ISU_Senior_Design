import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy.orm import aliased
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Post, HasSeen, User
from datetime import datetime, date

def handler(event, context):
    try:
        query_params = event.get('queryStringParameters') or {}

        email = event['requestContext']['authorizer']['claims']['email']

        limit = int(query_params.get('limit', 20))

        status_code, message = getFeed(email, limit)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting feed: {str(e)}")


@session_handler
def getFeed(session, email, limit: int = 20):
    try:
        user = get_user_by_email(session, email)
        userID = user.userID
        status, followed_users = getFollowing(session, userID)
        if status != 200:
            return 500, "Error retrieving followed users"
        
        followed_user_ids = {user["userID"] for user in followed_users}

        followed_posts = getFollowedPosts(session, userID, followed_user_ids, limit)

        if len(followed_posts) >= limit:
            posts_to_return = followed_posts
        else:
            remaining_limit = limit - len(followed_posts)
            non_followed_posts = getNonFollowedPosts(session, userID, followed_user_ids, remaining_limit)
            posts_to_return = followed_posts + non_followed_posts

        feed_posts_serialized = [
            {
                "postID": post.postID,
                "userID": post.userID,
                "username": post.userRel.username,
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
            }
            for post in posts_to_return
        ]

        return 200, feed_posts_serialized

    except Exception as e:
        return handle_exception(e, "getFeed")


def getFollowedPosts(session, userID: int, followed_user_ids, limit):
    seen_alias = aliased(HasSeen)

    return session.query(Post).filter(
        Post.userID.in_(followed_user_ids),
        Post.userID != userID,
        Post.status.ilike("public"),
        ~session.query(seen_alias).filter(
            seen_alias.postID == Post.postID,
            seen_alias.userID == userID
        ).exists()
    ).order_by(Post.createdDate.desc()).limit(limit).all()


def getNonFollowedPosts(session, userID: int, followed_user_ids, limit):
    seen_alias = aliased(HasSeen)

    return session.query(Post).filter(
        Post.userID.notin_(followed_user_ids),
        Post.userID != userID,
        Post.status.ilike("public"),
        ~session.query(seen_alias).filter(
            seen_alias.postID == Post.postID,
            seen_alias.userID == userID
        ).exists()
    ).order_by(Post.createdDate.desc()).limit(limit).all()


def getFollowing(session, user_id):
    try:
        user = session.query(User).filter(User.userID == user_id).one_or_none()
        if not user:
            return 404, f"User with ID {user_id} does not exist."

        following = [
            {
                "userID": follow.followed.userID,
                "username": follow.followed.username,
                "email": follow.followed.email,
            }
            for follow in user.following
        ]
        return 200, following

    except Exception as e:
        return handle_exception(e, "getFollowing")
