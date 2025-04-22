from utils import create_response, handle_exception
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import User, Follow
from sqlalchemy import select, func
from urllib.parse import parse_qs

def handler(event, context):
    try:
        # Get UUID from path parameters
        uuid = event['pathParameters'].get('id')
        if not uuid:
            return create_response(400, 'Missing uuid')

        # Parse query string for countOnly flag
        raw_query = event.get('queryStringParameters') or {}
        count_only = raw_query.get('countOnly', 'false').lower() == 'true'

        status_code, message = get_followers(uuid, count_only)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving followers: {str(e)}")


@session_handler
def get_followers(session, uuid, count_only=False):
    try:
        user = session.query(User).filter(User.uuid == uuid).one_or_none()
        if not user:
            return 404, f"User with uuid {uuid} does not exist."

        if count_only:
            # Efficient count using JOIN
            count = session.execute(
                select(func.count()).select_from(Follow).where(Follow.followedId == user.userID)
            ).scalar()
            return 200, { "follower_count": count }

        else:
            # Full list of followers
            followers = [
                {
                    "uuid": follow.follower.uuid,
                    "username": follow.follower.username,
                    "profilePic": follow.follower.profilePicURL
                }
                for follow in user.followers
            ]
            return 200, followers

    except Exception as e:
        return handle_exception(e, "Error accessing database")
