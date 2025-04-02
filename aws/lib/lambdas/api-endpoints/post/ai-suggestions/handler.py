from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from sqlalchemy import select
from datetime import datetime, date

def handler(event, context):
    try:
        # Get user id from request
        path_params = event.get('pathParameters') or {}

        post_id = path_params.get('id')

        # Check for missing required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to get the AI recommendations
        status_code, message = getAiRecommendations(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting recommendations: {str(e)}")
    

def getAiRecommendations(post_id):
    # Try to get AI recommendations
    try:
        session = create_session()

        # Fetch recommended posts
        query = (
            query here
        )

        # Execute the query
        recommended_posts = session.execute(query).scalars().all()

        if recommended_posts:
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
                for post in recommended_posts
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