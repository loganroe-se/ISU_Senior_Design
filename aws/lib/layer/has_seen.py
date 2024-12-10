import datetime
from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import HasSeen, User, Post

# Functions in this file meant to be used elsewhere:
# markAsSeen(userID, postIDs) --- Note: postIDs can be a singular number OR array of numbers
# getSeenPosts(userID)
# getUsers(postID)

def markAsSeen(userID, postIDs):
    # Try to mark the posts as seen
    try:
        # Create the session
        session = create_session()

        # Check if the userID exists
        user = session.query(User).filter_by(userID=userID).first()
        if not user:
            raise Exception("404", f"User with userID: {userID} was not found")
        
        # Check if the postID(s) exist
        posts = session.query(Post).filter(Post.postID.in_(postIDs)).all()
        valid_postIDs = {post.postID for post in posts}

        # Filter out the invalid postIDs
        invalid_postIDs = set(postIDs) - valid_postIDs
        if invalid_postIDs:
            raise Exception(404, f"Invalid postIDs: {', '.join(map(str, invalid_postIDs))}")
        
        # Mark the valid posts as seen
        for postID in valid_postIDs:
            session.add(HasSeen(userID=userID, postID=postID, timeViewed=datetime.now()))

        # Commit the changes
        session.commit()

        return 200, f"Posts marked as seen succesfully for the user with userID: {userID}"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Has_Seen.py")
        return code, msg
    
    finally:
        if 'sesion' in locals() and session:
            session.close()


def getSeenPosts(userID):
    # Try to get seen posts by userID
    try:
        # Create the session
        session = create_session()

        # Check if the userID exists
        user = session.query(User).filter_by(userID=userID).first()
        if not user:
            raise Exception("404", f"User with userID: {userID} was not found")
        
        # Get the list of posts for the userID
        seen_posts = session.query(Post).join(HasSeen, HasSeen.postID == Post.postID).filter(HasSeen.userID == userID).all()

        if not seen_posts:
            return 404, f"No posts have been seen by user with userID: {userID}"
        else:
            return 200, seen_posts

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Has_Seen.py")
        return code, msg
    
    finally:
        if 'sesion' in locals() and session:
            session.close()


def getUsers(postID):
    # Try to get the users that have seen a post
    try:
        # Create the session
        session = create_session()

        # Check if the postID exists
        post = session.query(Post).filter_by(postID=postID).first()
        if not post:
            raise Exception("404", f"Post with postID: {postID} was not found")

        # Get the user details
        users = session.query(User).join(HasSeen, HasSeen.userID == User.userID).filter(HasSeen.postID == postID).all()

        if not users:
            return 404, f"No users have seen post with postID: {postID}"        
        else:
            return 200, users

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Has_Seen.py")
        return code, msg
    
    finally:
        if 'sesion' in locals() and session:
            session.close()