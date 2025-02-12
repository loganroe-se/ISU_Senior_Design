import json
from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Post

def handler(event, context):    
    try:
        # Get post ID from path parameters
        post_id = event['pathParameters'].get('post-id')

        # Check for missing required value
        if not post_id:
            return create_response(400, 'Missing required parameter: post id')
        
        # Call function to fetch comments
        status_code, data = getCommentsForPost(post_id)

        # Return response
        return create_response(status_code, data)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error retrieving comments: {str(e)}")
    

def getCommentsForPost(post_id):
    try:
        # Create session
        session = create_session()

        # Fetch the post along with its comments
        post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

        if not post:
            return 404, "Post not found."

        # Get comments from the post relationship
        comments = post.comments

        if not comments:
            return 404, "No comments found for this post."

        # Format comments into a list of dictionaries
        comments_list = [
            {
                "commentID": comment.commentID,
                "userID": comment.userID,
                "postID": comment.postID,
                "content": comment.content,
                "createdDate": comment.createdDate.isoformat()
            }
            for comment in comments
        ]

        return 200, comments_list

    except Exception as e:
        # Handle exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
