from utils import create_response, handle_exception
from sqlalchemy import select
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Comment

def handler(event, context):    
    try:
        # Get comment ID from path parameters
        commentId = event['pathParameters'].get('comment-id')

        if not commentId:
            return create_response(400, 'Missing required parameter: commentId')
        
        # Call function to remove the comment
        status_code, message = deleteComment(commentId)

        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting comment: {str(e)}")


@session_handler
def deleteComment(session, commentId):
    try:
        # Fetch comment
        comment = session.execute(
            select(Comment).where(Comment.commentID == commentId)
        ).scalars().first()

        if not comment:
            return 404, "Comment was not found."

        session.delete(comment)
        return 200, "Comment was deleted successfully."

    except Exception as e:
        return handle_exception(e, "Error accessing database")
