from sqlalchemy import select
from dripdrop_utils import create_session
from dripdrop_orm_objects import Image, Post

# Functions in this file meant to be used elsewhere:
# createImage(post_id, image_url)
# deleteImage(image_id)
# getImageByImageId(image_id)
# getImageByPostId(post_id)
# getImages()
# updateImage(image_id, post_id, image_url)

def createImage(post_id, image_url):
    # Try to create the image
    try:
        # Create the session
        session = create_session()

        # Ensure that the post_id exists
        if post_id and not session.execute(select(Post).where(Post.postID == post_id)).scalars().first():
            raise Exception("404", f'Post with postID: {post_id} does not exist')

        # Create a new image
        new_image = Image(postID=post_id, imageURL=image_url)

        # Add the image to the db
        session.add(new_image)
        session.commit()

        # Construct the return message
        if post_id:
            message = f"Image with imageID: {new_image.imageID} and postID: {post_id} was created successfully"
        else:
            message = f"Image with imageID: {new_image.imageID} was created successfully"

        # Return message
        return 201, message

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def deleteImage(image_id):
    # Try to delete the image
    try:
        # Create the session
        session = create_session()

        # Fetch the image
        image = session.execute(select(Image).where(Image.imageID == image_id)).scalars().first()

        if image:
            session.delete(image)
            session.commit()

            return 200, f'Image with imageID: {image_id} was deleted successfully'
        else:
            return 404, f'Image with imageID: {image_id} was not found'

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def getImageByImageId(image_id):
    # Try to get the image
    try:
        # Create the session
        session = create_session()

        # Fetch the image
        image = session.execute(select(Image).where(Image.imageID == image_id)).scalars().first()

        if image:
            # Convert image to dictionary or JSON-friendly format
            image_data = {
                'imageID': image.imageID,
                'postID': image.postID,
                'imageURL': image.imageURL
            }
            return 200, image_data
        else:
            return 404, f'Image with imageID: {image_id} not found'

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def getImageByPostId(post_id):
    # Try to get the image
    try:
        # Create the session
        session = create_session()

        # Fetch all images with the requested post ID
        images = session.execute(select(Image).where(Image.postID == post_id)).scalars().all()

        if images:
            # Convert images to dictionary or JSON-friendly format
            images_data = [{
                'imageID': image.imageID,
                'postID': image.postID,
                'imageURL': image.imageURL
            } for image in images]
        
            # Return message
            return 200, images_data
        else:
            return 404, f'Image(s) with postID: {post_id} was/were not found'

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def getImages():
    # Try to get all images
    try:
        # Create the session
        session = create_session()

        # Fetch all images
        images = session.execute(select(Image)).scalars().all()  # Get a list of image objects

        images_data = [{
            'imageID': image.imageID,
            'postID': image.postID,
            'imageURL': image.imageURL
        } for image in images]
        
        # Return message
        return 200, images_data

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()


def updateImage(image_id, post_id, image_url):
    # Try to update the image
    try:
        # Create the session
        session = create_session()

        # Get the image
        image = session.execute(select(Image).where(Image.imageID == image_id)).scalars().first()

        if image:
            # Ensure that the post_id exists
            if post_id and not session.execute(select(Post).where(Post.postID == post_id)).scalars().first():
                raise Exception("404", f'Post with postID: {post_id} does not exist')

            # Update image information
            if post_id:
                image.postID = post_id
            if image_url:
                image.imageURL = image_url
                
            session.commit()

            return 200, f'Image with imageID: {image_id} was updated successfully'
        else:
            return 404, f'Image with imageID: {image_id} was not found'

    except Exception as e:
        code, msg = e.args
        print(f"Image.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Image.py Error - Message: {msg}"

    finally:
        if 'session' in locals() and session:
            session.close()