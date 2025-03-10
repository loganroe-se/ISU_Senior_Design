from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from sqlalchemy.orm import joinedload 
from dripdrop_orm_objects import User, Post


def handler(event, context):
    try:
        # Get id from path parameters
        user_id = event['pathParameters'].get('id')
        
        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call another function to get the post
        status_code, message = getUserSuperById(user_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error retrieving user: {str(e)}")
    
def getUserSuperById(user_id):
    # Try to get the user
    try:
        # Create the session
        session = create_session()

        # Fetch user
        user = session.execute(select(User).where(User.userID == user_id)).scalars().first()

        # Fetch all posts with their related images
        posts_result = (
            session.query(Post)
            .where(Post.userID == user_id)
            .options(joinedload(Post.images), joinedload(Post.likes), joinedload(Post.comments))
            .all()
        )

        # Create a list of post dictionaries, including images
        posts_list = [
            {
                "postID": post.postID,
                "userID": post.userID,
                "caption": post.caption,
                "createdDate": (
                    post.createdDate.isoformat()
                    if isinstance(post.createdDate, (datetime, date))
                    else post.createdDate
                ),
                "images": [
                    {"imageID": image.imageID, "imageURL": image.imageURL}
                    for image in post.images
                ],
                "numLikes": len(post.likes),
                "numComments": len(post.comments),
            }
            for post in posts_result
        ]

        if user:
            # Convert user to dictionary or JSON-friendly format
            user_data = {
                'id': user.userID,
                'username': user.username,
                'email': user.email,
                'profilePic': user.profilePicURL,
                'dob': user.dob.isoformat(),
                'accountType': user.accountType,
                'posts': posts_list
            }
            return 200, user_data
        else:
            return 404, f'User with userID: {user_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()