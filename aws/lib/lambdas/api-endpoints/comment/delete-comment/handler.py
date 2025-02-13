from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Comment

def handler(event, context):    
    try:
        # Get comment ID from path parameters
        commentId = event['pathParameters'].get('comment-id')

        # Check for missing required value
        if not commentId:
            return create_response(400, 'Missing required parameter: commentId')
        
        # Call function to remove the comment
        status_code, message = deleteComment(commentId)

        # Return response
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting comment: {str(e)}")
    

def deleteComment(commentId):
    try:
        # Create session
        session = create_session()

        # Fetch comment
        comment = session.execute(
            select(Comment).where(Comment.commentID == commentId)
        ).scalars().first()

        if comment:
            session.delete(comment)
            session.commit()
            return 200, "Comment was deleted successfully."
        else:
            return 404, "Comment was not found."

    except Exception as e:
        # Handle exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
