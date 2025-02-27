from sqlalchemy_utils import create_session
from sqlalchemy.orm import aliased
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, HasSeen, User
from datetime import datetime, date

def handler(event, context):
    try:  
        # Get path params & query params      
        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}

        # Get id & limit from path parameters
        userID = path_params.get('userID')
        limit = query_params.get('limit', 20)

        # Check for missing, required values
        if not userID:
            return create_response(400, 'Missing required field: userID')
        
        # Call another function to get the feed
        status_code, message = getFeed(userID, limit)

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting feed: {str(e)}")


# General feed function -- limit is the number of posts to return, with default being 20
def getFeed(userID, limit: int = 20):
    # Ensure limit is an int
    limit = int(limit)

    # Try to get the feed
    try:
        # Create the session
        session = create_session()
        
        # Get the list of users followed by the user
        status, followed_users = getFollowing(userID)
        if status != 200:
            return 500, "Error retrieving followed users"
        
        followed_user_ids = {user["userID"] for user in followed_users}

        # Get posts from followed users
        followed_posts = getFollowedPosts(userID, session, followed_user_ids, limit)

        # If there are enough posts, return them
        num_followed_posts = len(followed_posts)
        if num_followed_posts >= limit:
            return 200, followed_posts[:limit]
        
        # If there are not enough posts, calculate how many more are needed
        remaining_limit = limit - num_followed_posts

        # Get posts from non-followed users
        non_followed_posts = getNonFollowedPosts(userID, session, followed_user_ids, remaining_limit)

        feed_posts = followed_posts + non_followed_posts[:remaining_limit]

        # Serialize posts before returning
        feed_posts_serialized = [
            {
                "postID": post.postID,
                "userID": post.userID,
                "caption": post.caption,
                "createdDate": (
                    post.createdDate.isoformat()
                    if isinstance(post.createdDate, (datetime, date))
                    else post.createdDate
                ),
                "images": [
                    {"imageID": image.imageID, "imageURL": image.imageURL}
                    for image in post.images
                ],
                "numLikes": len(post.likes),
                "numComments": len(post.comments),
                "userHasLiked": int(userID) in {like.userID for like in post.likes},
            } for post in feed_posts
        ]

        return 200, feed_posts_serialized

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Feed.py")
        return code, msg
    
    finally:
        if 'session' in locals() and session:
            session.close()


# Helper -- Get the unseen list of posts from followed users
def getFollowedPosts(userID: int, session, followed_user_ids, limit):
    # Set up alias
    seen_alias = aliased(HasSeen)

    # Get the posts from followed users excluding the ones the user has already seen
    followed_posts = session.query(Post).filter(
        Post.userID.in_(followed_user_ids),
        Post.userID != userID,
        ~session.query(seen_alias).filter(
            seen_alias.postID == Post.postID,
            seen_alias.userID == userID
        ).exists()
    ).order_by(Post.createdDate.desc()).limit(limit).all()

    return followed_posts

# Helper -- Get the unseen list of posts from not followed users
def getNonFollowedPosts(userID: int, session, followed_user_ids, limit):
    # Set up alias
    seen_alias = aliased(HasSeen)

    # Get the posts from non-followed users excluding the ones the user has already seen
    non_followed_posts = session.query(Post).filter(
        Post.userID.notin_(followed_user_ids),
        Post.userID != userID,
        ~session.query(seen_alias).filter(
            seen_alias.postID == Post.postID,
            seen_alias.userID == userID
        ).exists()
    ).order_by(Post.createdDate.desc()).limit(limit).all()

    return non_followed_posts

# Helper -- Get the list of people following a given user ID
def getFollowing(user_id):
    # Try to get list of all users who user_id follows
    try:
        # Create the session
        session = create_session()

        # Fetch the user by ID
        user = session.query(User).filter(User.userID == user_id).one_or_none()

        # If user does not exist, return 404
        if not user:
            return 404, f"User with ID {user_id} does not exist."

        # Get all users that the current user is following
        following = [
            {
                "userID": follow.followed.userID,
                "username": follow.followed.username,
                "email": follow.followed.email,
            }
            for follow in user.following
        ]

        # Return the list of following users
        return 200, following

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "follow.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()