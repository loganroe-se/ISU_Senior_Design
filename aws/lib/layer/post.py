from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Post, User
from datetime import datetime, date

# Functions in this file meant to be used elsewhere:
# createPost(userID, caption)
# deletePost(post_id)
# getPostById(post_id)
# getPosts()
# updatePost(post_id, caption, created_date)

def createPost(user_id, caption):
    # Try to create the post
    try:
        # Create the session
        session = create_session()

        # Verify if userID exists in the User table
        user_exists = session.query(User).filter_by(userID=user_id).first()

        if not user_exists:
            raise Exception("409", f"User with userID: {user_id} does not exist")
        
        # Auto-fill createdDate with current time
        createdDate = date.today()

        # Create a new post
        new_post = Post(userID=user_id, caption=caption, createdDate=createdDate)

        # Add the post to the databse
        session.add(new_post)
        session.commit()

        # Return message
        return 201, f"Post with postID: {new_post.postID} by user with userID: {user_id} was created successfully"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def deletePost(post_id):
    # Try to delete the post
    try:
        # Create the session
        session = create_session()

        # Fetch posts that matches the id
        post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()
        
        if post:
            session.delete(post)
            session.commit()

            return 200, f'Post with postID: {post_id} was deleted successfully'
        else:
            return 404, f'Post with postID: {post_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getPostById(post_id):
    # Try to get the post
    try:
        # Create the session
        session = create_session()

        # Fetch post that matches id
        post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

        if post:
            # Convert post to dictionary or JSON-friendly format
            post_data = {
                'postID' : post.postID,
                'userID': post.userID,
                'caption': post.caption,
                'createdDate': (post.createdDate.isoformat() if isinstance(post.createdDate, (datetime, date))
                else post.createdDate)
            }

            return 200, post_data
        else:
            return 404, f'Post with postID: {post_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getPosts():
    # Try to get all posts
    try:
        # Create the session
        session = create_session()

        # Fetch all the posts
        posts_result = session.execute(select(Post)).scalars().all()  # Get a list of user objects

        # Create a list of post dictionaries directly
        posts_list = [{'postID': post.postID, 'userID': post.userID, 'caption': post.caption, 'createdDate': (
            post.createdDate.isoformat() if isinstance(post.createdDate, (datetime, date))
            else post.createdDate)} for post in posts_result]
        
        # Return message
        return 200, posts_list

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def updatePost(post_id, caption, created_date):
    # Try to get all posts
    try:
        # Create the session
        session = create_session()

        # Fetch the post
        post = session.execute(select(Post).where(Post.postID == post_id)).scalars().first()

        if post:
            # Update post information
            if caption:
                post.caption = caption
            if created_date:
                post.createdDate = created_date

            session.commit()

            return 200, f'Post with postID: {post_id} was updated successfully'
        else:
            return 404, f'Post with postID: {post_id} was not found'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Post.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()