from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy.orm import joinedload 
from datetime import datetime, date

def handler(event, context):
    try:

        # Call function to get all posts
        status_code, message = getPosts()

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")
    

def getPosts():
    try:
        # Create the session
        session = create_session()

        # Fetch all posts with their related images
        posts_result = (
            session.query(Post).options(joinedload(Post.images)).all()
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
            }
            for post in posts_result
        ]

        # Return message
        return 200, posts_list

    except Exception as e:
        # Handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        # Ensure session is closed
        if "session" in locals() and session:
            session.close()