import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Post
from datetime import datetime, date

def handler(event, context):
    try:
        # Get search string from path parameters
        search_string = event['pathParameters'].get('searchString')
        
        if not search_string:
            return create_response(400, 'Missing searchString')
        
        # Call helper function to execute the search
        status_code, message = searchPosts(search_string)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error searching posts: {str(e)}")
    


def searchPosts(search_string):
    try:
        # Create the session
        session = create_session()

        # Select the username and userID of first 20 users that match the search string
        posts = session.execute(
            select(Post)
            .filter(Post.caption.ilike(f"%{search_string}%"))
            .limit(20)
        ).scalars().all()

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
                for post in posts
        ]

        return 200, posts_list

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()