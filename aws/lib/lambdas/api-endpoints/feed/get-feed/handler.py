import json
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, HasSeen, User

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userID = body.get('userID')
        limit = body.get('limit', 20)

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

        return 200, feed_posts

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Feed.py")
        return code, msg
    
    finally:
        if 'session' in locals() and session:
            session.close()


# Helper -- Get the unseen list of posts from followed users
def getFollowedPosts(userID: int, session, followed_user_ids, limit):
    # Get the posts from followed users excluding the ones the user has already seen
    followed_posts = session.query(Post).join(HasSeen, HasSeen.postID == Post.postID, isouter=True) \
        .filter(Post.userID.in_(followed_user_ids)) \
        .filter(HasSeen.userID != userID) \
        .order_by(Post.createdDate.desc()) \
        .limit(limit) \
        .distinct(Post.postID) \
        .all()

    return followed_posts

# Helper -- Get the unseen list of posts from not followed users
def getNonFollowedPosts(userID: int, session, followed_user_ids, limit):
    # Get the posts from non-followed users excluding the ones the user has already seen
    non_followed_posts = session.query(Post).join(HasSeen, HasSeen.postID == Post.postID, isouter=True) \
        .filter(Post.userID.notin_(followed_user_ids)) \
        .filter(HasSeen.userID != userID) \
        .order_by(Post.createdDate.desc()) \
        .limit(limit) \
        .distinct(Post.postID) \
        .all()

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