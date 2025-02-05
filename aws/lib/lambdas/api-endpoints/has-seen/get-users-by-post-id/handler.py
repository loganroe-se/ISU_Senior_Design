from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        # Get id from path parameters
        post_id = event['pathParameters'].get('id')

        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to get the users
        status_code, message = getUsers(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving users: {str(e)}")
    

def getUsers(postID):
    # Try to get the users that have seen a post
    try:
        # Create the session
        session = create_session()

        # Check if the postID exists
        post = session.query(Post).filter_by(postID=postID).first()
        if not post:
            raise Exception("404", f"Post with postID: {postID} was not found")

        # Get the user details
        users_query = session.query(User).join(HasSeen, HasSeen.userID == User.userID).filter(HasSeen.postID == postID)
        users = users_query.all()

        if not users:
            return 404, f"No users have seen post with postID: {postID}"        
        else:
            # Serialize the users
            users_serialized = [{'username': user.username, 'email': user.email, 'id': user.userID} for user in users]

            return 200, users_serialized

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "GetUsersByPostID Handler.py")
        return code, msg
    
    finally:
        if 'session' in locals() and session:
            session.close()