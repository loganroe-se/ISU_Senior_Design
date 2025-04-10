import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Follow, User

def handler(event, context):
    try:
        # Parse request body
        body = json.loads(event['body'])
        followerId = body.get('followerId')
        followedId = body.get('followedId')

        if not followerId or not followedId:
            return create_response(400, 'Missing required field')

        status_code, message = createFollow(followerId, followedId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating follow relationship: {str(e)}")


@session_handler
def createFollow(session, followerId, followedId):
    try:
        # Check if both users exist
        follower_exists = session.execute(
            select(User).where(User.uuid == followerId)
        ).scalars().first()
        followed_exists = session.execute(
            select(User).where(User.uuid == followedId)
        ).scalars().first()

        if not follower_exists or not followed_exists:
            return 404, "One or both user IDs do not exist."

        # Check for duplicate follow
        existing_follow = session.execute(
            select(Follow).where(
                and_(
                    Follow.followerId == followerId,
                    Follow.followedId == followedId
                )
            )
        ).scalars().first()

        if existing_follow:
            return 409, "Duplicate follow: relationship already exists."

        # Create and add follow relationship
        new_follow = Follow(followedId=followedId, followerId=followerId)
        session.add(new_follow)

        return 201, f"Follow relationship created between followerId: {followerId} and followedId: {followedId}"

    except Exception as e:
        return handle_exception(e, "Error creating follow relationship")
