from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, HasSeen

def handler(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')

        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call another function to get the posts
        status_code, message = getSeenPosts(user_id)

        # Return message
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting seen posts: {str(e)}")


def getSeenPosts(userID):
    # Try to get seen posts by userID
    try:
        # Create the session
        session = create_session()

        # Check if the userID exists
        user = session.query(User).filter_by(userID=userID).first()
        if not user:
            raise Exception("404", f"User with userID: {userID} was not found")
        
        # Get the list of posts for the userID
        seen_posts = session.query(Post).join(HasSeen, HasSeen.postID == Post.postID).filter(HasSeen.userID == userID).all()

        if not seen_posts:
            return 404, f"No posts have been seen by user with userID: {userID}"
        else:
            return 200, seen_posts

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Has_Seen.py")
        return code, msg
    
    finally:
        if 'sesion' in locals() and session:
            session.close()