from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import User, Post, HasSeen

# Functions in this file meant to be used elsewhere:
# getFeed(userID, limit: int = 20) -- Default limit of 20

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


# # Helper -- Get the unseen list of posts from followed users
# def getFollowedPosts(userID: int, session):
#     # Get the list of users followed by the user
#     status, followed_users = followPY.getFollowing(userID)

#     if status != 200:
#         return []

#     # Get all posts from the followed users
#     followed_posts = []
#     for followed_user in followed_users:
#         status, posts = postPY.getPostsByUserId(followed_user["userID"])

#         if status != 200:
#             continue

#         followed_posts.extend(posts)

#     # Filter out the posts that the user has seen already
#     unseen_posts = filterSeenPosts(userID, followed_posts, session)

#     # Sort posts by created date in descending order
#     unseen_posts.sort(key=lambda post: post.createdDate, reverse=True)

#     return unseen_posts

# # Helper -- Get the unseen list of posts from not followed users
# def getNonFollowedPosts(userID: int, session):
#     # Get the list of users followed by the user
#     status, followed_users = followPY.getFollowing(userID)
#     if status != 200:
#         return []
    
#     followed_user_ids = {user["userID"] for user in followed_users}

#     # Get all non-followed posts
#     non_followed_posts = session.query(Post).filter(Post.userID.notin_(followed_user_ids)).order_by(Post.createdDate.desc()).all()

#     # Filter out the posts that the user has already seen
#     unseen_posts = filterSeenPosts(userID, non_followed_posts, session)

#     return unseen_posts
    
# # Helper -- Filter out posts the user has already seen
# def filterSeenPosts(userID, posts, session):
#     # Get the list of posts the user has already seen
#     status, seen_posts = hasSeenPY.getSeenPosts(userID)
#     if status == 200:
#         seen_post_ids = {post.postID for post in seen_posts}
#     else:
#         seen_post_ids = set()

#     # Filter out the posts the user has already seen
#     unseen_posts = [post for post in posts if post.postID not in seen_post_ids]
#     return unseen_posts