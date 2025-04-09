from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        # Get post ID from path parameters
        post_id = event['pathParameters'].get('id')

        if not post_id:
            return create_response(400, 'Missing post ID')

        status_code, message = getUsers(post_id)
        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error retrieving users: {str(e)}")


@session_handler
def getUsers(session, postID):
    try:
        post = session.query(Post).filter_by(postID=postID).first()
        if not post:
            return 404, f"Post with postID: {postID} was not found"

        users = session.query(User).join(
            HasSeen, HasSeen.userID == User.userID
        ).filter(HasSeen.postID == postID).all()

        if not users:
            return 404, f"No users have seen post with postID: {postID}"

        users_serialized = [
            {
                'username': user.username,
                'email': user.email,
                'id': user.userID
            }
            for user in users
        ]

        return 200, users_serialized

    except Exception as e:
        return handle_exception(e, "GetUsersByPostID")
