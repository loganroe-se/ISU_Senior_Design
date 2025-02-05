import json
from image import save_image_to_db
from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, User, Item, ClothingItem, Coordinate
from datetime import date

# main function to handle the request body and call helper functions to populate all the tables
def handler(event, context):
    try:
        # Parse the user data from event
        body = json.loads(event['body'])

        # Get post/image attributes
        userID = body.get('userID')
        caption = body.get('caption', "")
        images = body.get('images')

        # Get optional coordinates
        xCoord = body.get('xCoord')
        yCoord = body.get('yCoord')

        # Get optional clothing item details
        name = body.get('name')
        brand = body.get('brand')
        category = body.get('category')
        price = body.get('price')
        itemURL = body.get('itemURL')
        size = body.get('size')     


        # Check for missing, required values
        if not userID:
            return create_response(400, 'Missing required field: userID')
        
        # Call another function to create the user
        status_code, message = createPost(userID, caption, images, xCoord, yCoord, name, brand, category, price, itemURL, size)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error creating post: {str(e)}")
    

def createPost(user_id, caption, images, xCoord=None, yCoord=None, name="", brand="", category="", price="", itemURL="", size=""):
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

        #---------------- Start of new code ----------------------

        # could add:
        # saved_images = save_image_to_db(.........)
        # for image in saved_images:
        # do the next few lines

        imageID = 1

        if xCoord and yCoord:
            coordinateID = createCoordinates(session, xCoord, yCoord)
        else:
            coordinateID = None

        clothingItemID = createClothingItem(session, name, brand, category, price, size)

        createItem(session, imageID, coordinateID, clothingItemID)

        #-------------- End of new code -----------------------------

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


# ------------------ New functions --------------------------

def createCoordinates(session, xCoord, yCoord):
    # Create a new coordinate entry
    new_coordinates = Coordinate(xCoord = xCoord, yCoord = yCoord)
    session.add(new_coordinates)
    session.commit()
    return new_coordinates.coordinateID

def createClothingItem(session, name, brand, category, price, itemURL, size):
    new_clothingItem = ClothingItem(name = name, category = category, price = price, itemURL = itemURL, size = size)
    session.add(new_clothingItem)
    session.commit()
    return new_clothingItem.clothingItemID


def createItem(session, imageID, coordinateID, clothingItemID):
    new_item = Item(imageID = imageID, coordinateID = coordinateID, clothingItemID = clothingItemID)
    session.add(new_item)
    session.commit()
    return 0
