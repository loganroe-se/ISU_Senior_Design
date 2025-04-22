from sqlalchemy import select
from sqlalchemy_utils import session_handler
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import NoResultFound
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User
from datetime import datetime, date

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}

        uuid = path_params.get('uuid')
        post_status = query_params.get('status')

        if not uuid:
            return create_response(400, 'Missing user ID')

        if post_status and post_status not in ['PRIVATE', 'NEEDS_REVIEW', 'PUBLIC']:
            return create_response(400, 'Invalid status value. Must be one of: PRIVATE, NEEDS_REVIEW, PUBLIC')

        status_code, message = getPostsByUserId(uuid, post_status)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting posts: {str(e)}")


@session_handler
def getPostsByUserId(session, uuid, post_status=None):
    try:
        # Query to fetch posts of the user with the given UUID
        query = (
            select(Post)
            .join(Post.userRel)  # Join with the User table
            .options(
                joinedload(Post.images),  # Eager load images
                joinedload(Post.likes),   # Eager load likes
                joinedload(Post.comments) # Eager load comments
            )
            .where(User.uuid == uuid)  # Filter by user's UUID
        )

        # Filter by post status if provided
        if post_status:
            query = query.where(Post.status == post_status)

        # Execute the query and fetch results
        posts_result = session.execute(query).unique().scalars().all()

        # Construct the response
        posts_list = [
            {
                "postID": post.postID,
                "uuid": post.userRel.uuid,
                "status": post.status,
                "caption": post.caption,
                "createdDate": (
                    post.createdDate.isoformat()
                    if isinstance(post.createdDate, (datetime, date))
                    else str(post.createdDate)
                ),
                "images": [
                    {"imageID": image.imageID, "imageURL": image.imageURL}
                    for image in post.images
                ],
                "numLikes": len(post.likes),
                "numComments": len(post.comments),
                "user": {
                    "username": post.userRel.username,
                    "profilePic": post.userRel.profilePicURL,
                },
            }
            for post in posts_result
        ]

        return 200, posts_list

    except NoResultFound:
        return 404, f"No user found with UUID: {uuid}"
    except Exception as e:
        return handle_exception(e, "Error accessing database")
