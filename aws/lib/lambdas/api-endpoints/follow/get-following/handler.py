from utils import create_response, handle_exception
from sqlalchemy_utils import session_handler, get_user_by_email
from dripdrop_orm_objects import User, Follow
from sqlalchemy import select, func, and_

def handler(event, context):
    try:
        # Get target UUID from path parameters
        uuid = event['pathParameters'].get('id')
        if not uuid:
            return create_response(400, 'Missing uuid')

        # Get query parameters
        raw_query = event.get('queryStringParameters') or {}
        count_only = raw_query.get('countOnly', 'false').lower() == 'true'
        check_follow = raw_query.get('checkFollow', 'false').lower() == 'true'

        # Get requester's email if follow-check is enabled
        email = None
        if check_follow:
            claims = event.get('requestContext', {}).get('authorizer', {}).get('claims')
            email = claims.get('email') if claims else None
            if not email:
                return create_response(401, "Missing or invalid authorization")

        # Call logic
        status_code, message = get_followers(uuid, count_only, check_follow, email)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving followers: {str(e)}")


@session_handler
def get_followers(session, uuid, count_only=False, check_follow=False, email=None):
    try:
        target_user = session.query(User).filter(User.uuid == uuid).one_or_none()
        if not target_user:
            return 404, f"User with uuid {uuid} does not exist."

        if check_follow and email:
            caller_user = get_user_by_email(session, email)
            if not caller_user:
                return 404, f"User for email {email} does not exist."

            is_following = session.execute(
                select(func.count()).select_from(Follow).where(
                    and_(
                        Follow.followerId == caller_user.userID,
                        Follow.followedId == target_user.userID
                    )
                )
            ).scalar()

            return 200, { "is_following": is_following > 0 }

        if count_only:
            count = session.execute(
                select(func.count()).select_from(Follow).where(
                    Follow.followedId == target_user.userID
                )
            ).scalar()
            return 200, { "following_count": count }

        followers = [
            {
                "uuid": follow.follower.uuid,
                "username": follow.follower.username,
                "profilePic": follow.follower.profilePicURL
            }
            for follow in target_user.followers
        ]
        return 200, followers

    except Exception as e:
        return handle_exception(e, "Error accessing database")
