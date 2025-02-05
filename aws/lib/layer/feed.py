from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import User, Post, HasSeen

# Functions in this file meant to be used elsewhere:
# getFeed(userID, limit: int = 20) -- Default limit of 20




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