from sqlalchemy import select
from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post
from datetime import datetime, date

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}

        user_id = path_params.get('userID')
        post_status = query_params.get('status')

        if not user_id:
            return create_response(400, 'Missing user ID')

        if post_status and post_status not in ['PRIVATE', 'NEEDS_REVIEW', 'PUBLIC']:
            return create_response(400, 'Invalid status value. Must be one of: PRIVATE, NEEDS_REVIEW, PUBLIC')

        status_code, message = getPostsByUserId(user_id, post_status)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")


@session_handler
def getPostsByUserId(session, user_id, post_status=None):
    try:
        query = select(Post).where(Post.userID == user_id)
        if post_status:
            query = query.where(Post.status == post_status)

        posts_result = session.execute(query).scalars().all()

        posts_list = [
            {
                "postID": post.postID,
                "userID": post.userID,
                "status": post.status,
                "caption": post.caption,
                "createdDate": (
                    post.createdDate.isoformat()
                    if isinstance(post.createdDate, (datetime, date))
                    else str(post.createdDate)
                ),
                "images": [
                    {"imageID": image
