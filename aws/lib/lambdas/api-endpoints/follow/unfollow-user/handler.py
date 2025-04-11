import json
from utils import create_response, handle_exception
from sqlalchemy import select, and_
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Follow

def handler(event, context):    
    try:
        body = json.loads(event['body'])
        followerId = body.get('followerId')
        followedId = body.get('followedId')

        if not followerId or not followedId:
            return create_response(400, 'Missing required field')

        status_code, message = deleteFollow(followerId, followedId)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error unfollowing user: {str(e)}")


@session_handler
def deleteFollow(session, followerId, followedId):
    try:
        follow = session.execute(
            select(Follow).where(
                and_(
                    Follow.followerId == followerId,
                    Follow.followedId == followedId
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
