from sqlalchemy import select
from dripdrop_utils import create_session
from dripdrop_orm_objects import Follow

# Functions in this file meant to be used elsewhere:
# createFollow(followerId, followedId)
# getFollowers(followId)
# getFollowing(followId)

def createFollow(followerId, followedId):
    # Try to create the follow relationship
    try:
        # Create the session
        session = create_session()

        new_follow = Follow(followedId=followedId, followerId = followerId)

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