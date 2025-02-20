import json
from image import save_image_to_db
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, ProfilePic
from sqlalchemy import select

def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get user id and the image
        userID = body.get('userID')
        image = body.get('image', "")

        # Check for missing, required values
        if not userID:
            return create_response(400, 'Missing required field: userID')
        
        # Call another function to create the user
        status_code, message = updateProfilePic(userID, image)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")
    

def updateProfilePic(userID, image):
    # Try to create the post
    try:
        # Create the session
        session = create_session()

        # Verify if userID exists in the User table
        user_exists = session.query(User).filter_by(userID=userID).first()

        if not user_exists:
            raise Exception("409", f"User with userID: {userID} does not exist")
        
        # Remove the profile pic from database
        if image == "":
            # Fetch the profile pic
            profile_pic = session.execute(select(ProfilePic).where(userID == userID)).scalars().first()

            session.delete(user)
            session.commit()
            return 200, f'Profile pic for user: {userID} was deleted successfully'

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