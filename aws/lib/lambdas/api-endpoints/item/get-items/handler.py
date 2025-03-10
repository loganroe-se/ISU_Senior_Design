from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, Image, Item, Coordinate

def handler(event, context):
    try:
        # Get id from path parameters
        post_id = event['pathParameters'].get('post_id')

        # Check for missing, required values
        if not post_id:
            return create_response(400, 'Missing post ID')
        
        # Call another function to create the user
        status_code, message = getCoordinates(post_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting coordinates: {str(e)}")
    

def getCoordinates(post_id):
    # Try to get the post
    try:
        # Create the session
        session = create_session()

        # Fetch all the items 
        items = (
            session.query(Item.clothingItemID, Coordinate.xCoord, Coordinate.yCoord)
            .join(Image, Image.imageID == Item.imageID)
            .join(Post, Post.postID == Image.postID)
            .join(Coordinate, Coordinate.coordinateID == Item.coordinateID)
            .filter(Post.postID == post_id)
            .all()
        )

        # Organize the coordinates found from query
        coordinate_data = [
            {"clothingItemID": item.clothingItemID, "xCoord": item.xCoord, "yCoord": item.yCoord}
            for item in items
        ]

        # Return the coordinates
        if coordinate_data:
            return 200, coordinate_data
        else:
            return 404, f"No items found for post ID: {post_id}"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()