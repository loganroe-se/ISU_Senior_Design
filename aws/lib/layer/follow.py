from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from dripdrop_utils import create_session
from dripdrop_orm_objects import Follow
import user as userPy

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
        existing_follow = session.execute(select(Follow).where(Follow.followerId == followerId and Follow.followedId == followedId)).scalars().first()
        if existing_follow:
            return 409, "Duplicate follow entry: The follow relationship already exists."

        # Create new follow relationship
        new_follow = Follow(followedId=followedId, followerId=followerId)

        # Add follow relationship to db
        session.add(new_follow)
        session.commit()
        session.close()

        # Successful return message
        return 201, f"Follow with followId: {new_follow.followId} was created successfully"
    
    except Exception as e:
        code, msg = e.args
        print(f"follow.py Error - Code: {code}, Message: {msg}")
        return int(code), f"follow.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def getFollowers(user_id):
    # Try to get list of all users following user_id
    try:
        # Create the session
        session = create_session()

        # Fetch all relationships where user_id is being followed
        followers_list = session.execute(select(Follow).where(Follow.followedId == user_id)).scalars().all()

        # Create a list of the users who follow user_id
        followers = []
        for follow in followers_list:
            # Get the user data for the follower in the follow relationship
            status, user_data = userPy.getUserById(follow.followerId)
            # If successful, add to followers list, else return the error
            if status == 200:
                followers.append(user_data)
            else:
                return status, f"Error retrieving followers: {user_data}"
    
        return 200, followers

    except Exception as e:
        code, msg = e.args
        print(f"follow.py Error - Code: {code}, Message: {msg}")
        return int(code), f"fser.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()

    
def getFollowing(user_id):
    # Try to get list of all users who user_id follows
    try:
        # Create the session
        session = create_session()

        # Fetch all relationships where user_id is the follower
        following_list = session.execute(select(Follow).where(Follow.followerId == user_id)).scalars().all()

        # Create a list of the users who user_id follows
        following = []
        for follow in following_list:
            # Get the user data for the followed in the follow relationship
            status, user_data = userPy.getUserById(follow.followedId)
            # If successful, add to following list, else return the error
            if status == 200:
                following.append(user_data)
            else:
                return status, f"Error retrieving followers: {user_data}"

        # Create a list of follow dictionaries

        return 200, following

    except Exception as e:
        code, msg = e.args
        print(f"follow.py Error - Code: {code}, Message: {msg}")
        return int(code), f"fser.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def deleteFollow(followerId, followedId):
    # Try to delete the following relationship
    try:
        # Create the session
        session = create_session()

        # Fetch follow relationship
        follow = session.execute(select(Follow).where(Follow.followerId == followerId and Follow.followedId == followedId)).scalars().first()

        if follow:
            session.delete(follow)
            session.commit()

            return 200, f'Follow relationship was deleted successfully'
        else:
            return 404, f'Follow relationship was not found'

    except Exception as e:
        code, msg = e.args
        print(f"follow.py Error - Code: {code}, Message: {msg}")
        return int(code), f"fser.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()