from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy import select
from datetime import datetime, date

def handler(event, context):
    try:
        # Parse the user data from event
        path_params = event.get('pathParameters') or {}

        user_id = path_params.get('userID')

        # Check for missing, required values
        if not user_id:
            return create_response(400, 'Missing user ID')
        
        # Call another function to create the user
        status_code, message = getPostsByUserId(user_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")
    

def getPostsByUserId(user_id):
    try:
        # Create the session
        session = create_session()

        # Fetch all posts that match the userID
        posts_result = (
            session.execute(select(Post).where(Post.userID == user_id)).scalars().all()
        )

        if posts_result:
            # Create a list of post dictionaries directly
            posts_list = [
                {
                    "postID": post.postID,
                    "userID": post.userID,
                    "status": post.status,
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

            return 200, posts_list
        else:
            return 200, []

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()