from sqlalchemy import select, and_
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Follow, User

# Functions in this file meant to be used elsewhere:
# createFollow(followerId, followedId)
# getFollowers(followId)
# getFollowing(followId)

def createFollow(followerId, followedId):
    # Try to create the follow relationship
    try:
        # Create the session
        session = create_session()

        # Check if the follow relationship already exists
        existing_follow = session.execute(select(Follow).where(and_(Follow.followerId == followerId, Follow.followedId == followedId))).scalars().first()
        if existing_follow:
            return 409, "Duplicate follow entry: The follow relationship already exists."

        # Create new follow relationship
        new_follow = Follow(followedId=followedId, followerId=followerId)

        # Add follow relationship to db
        session.add(new_follow)
        session.commit()
        session.close()

        # Successful return message
        return 201, f"Follow relationship between followerId: {followerId} and followedId: {followedId} was created successfully."
    
    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "follow.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getFollowers(user_id):
    # Try to get list of all users following user_id
    try:
        # Create the session
        session = create_session()

        # Fetch the user by ID
        user = session.query(User).filter(User.userID == user_id).one_or_none()

        # If user does not exist, return 404
        if not user:
            return 404, f"User with ID {user_id} does not exist."

        # Get all users that follow the current user
        followers = [
            {
                "userID": follow.follower.user_id,
                "username": follow.follower.username,
                "email": follow.follower.email,
            }
            for follow in user.followers
        ]

        # Return the list of followers
        return 200, followers

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "follow.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()

    
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
                "userID": follow.followed.user_id,
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


def deleteFollow(followerId, followedId):
    # Try to delete the following relationship
    try:
        # Create the session
        session = create_session()

        # Fetch follow relationship
        follow = session.execute(select(Follow).where(and_(Follow.followerId == followerId, Follow.followedId == followedId))).scalars().first()

        if follow:
            session.delete(follow)
            session.commit()

            return 200, f'Follow relationship was deleted successfully'
        else:
            return 404, f'Follow relationship was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "follow.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()