import json
from image import save_image_to_db
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User
from datetime import date

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get all body attributes
        userID = body.get('userID')
        caption = body.get('caption', "")
        images = body.get('images')

        # Check for missing, required values
        if not userID:
                return create_response(400, 'Missing required field: userID')
        
        # Call another function to create the user
        status_code, message = createPost(userID, caption, images)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")
    

def createPost(user_id, caption, images):
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

        session.add(new_post)
        session.commit()

        # Call the function to save images to the database
        save_image_to_db(session, new_post.postID, images)

        # Return success message after the transaction is committed
        return (
            201,
            f"Post with postID: {new_post.postID} by user with userID: {user_id} was created successfully",
        )

    except Exception as e:
        # Handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        # Ensure session is closed
        if "session" in locals() and session:
            session.close()
