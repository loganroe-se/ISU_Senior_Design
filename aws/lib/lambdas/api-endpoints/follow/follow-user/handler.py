import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Follow, User

def handler(event, context):
    try:
        # Parse request body
        body = json.loads(event['body'])
        email = event['requestContext']['authorizer']['claims']['email']
        followedId = body.get('followedId')

        if not followedId:
            return create_response(400, 'Missing required field')

        status_code, message = createFollow(email, followedId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating follow relationship: {str(e)}")


@session_handler
def createFollow(session, email, followedId):
    try:
        # Check if both users exist
        user = get_user_by_email(session, email)
        follower_exists = bool(user)

        followed_user =  session.query(User).filter_by(uuid=followedId).first()
        followed_exists = bool(followed_user)

        if not follower_exists or not followed_exists:
            return 404, "One or both user IDs do not exist."

        # Check for duplicate follow
        existing_follow = session.execute(
            select(Follow).where(
                and_(
                    Follow.followerId == user.userID,
                    Follow.followedId == followed_user.userID
                )
            )
        ).scalars().first()

        if existing_follow:
            return 409, "Duplicate follow: relationship already exists."

        # Create and add follow relationship
        new_follow = Follow(followedId=followed_user.userID, followerId=user.userID)
        session.add(new_follow)

        return 201, f"Follow relationship created between followerUuid: {user.uuid} and followedUuid: {followed_user.uuid}"

    except Exception as e:
        return handle_exception(e, "Error creating follow relationship")
