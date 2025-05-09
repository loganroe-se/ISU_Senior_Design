import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import Follow, User

def handler(event, context):    
    try:
        body = json.loads(event['body'])
        email = event['requestContext']['authorizer']['claims']['email']
        followedId = body.get('followedId')

        if not followedId:
            return create_response(400, 'Missing required field')

        status_code, message = deleteFollow(email, followedId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unfollowing user: {str(e)}")


@session_handler
def deleteFollow(session, email, followedId):
    try:
        user = get_user_by_email(session, email)
        followed_user = session.query(User).filter_by(uuid=followedId).first()

        if not user or not followed_user:
            return 404, 'One or both users do not exist'

        follow = session.execute(
            select(Follow).where(
                and_(
                    Follow.followerId == user.userID,
                    Follow.followedId == followed_user.userID
                )
            )
        ).scalars().first()

        if follow:
            session.delete(follow)
            return 200, 'Follow relationship was removed successfully'
        else:
            return 404, 'Follow relationship was not found'

    except Exception as e:
        return handle_exception(e, "Error accessing database")
