from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, Image, Item, Coordinate

def handler(event, context):
    try:
        # Get post ID from path parameters
        post_id = event['pathParameters'].get('post-id')

        if not post_id:
            return create_response(400, 'Missing post ID')

        status_code, message = getCoordinates(post_id)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting coordinates: {str(e)}")


@session_handler
def getCoordinates(session, post_id):
    try:
        items = (
            session.query(Item.clothingItemID, Coordinate.xCoord, Coordinate.yCoord)
            .join(Image, Image.imageID == Item.imageID)
            .join(Post, Post.postID == Image.postID)
            .join(Coordinate, Coordinate.coordinateID == Item.coordinateID)
            .filter(Post.postID == post_id)
            .all()
        )

        coordinate_data = [
            {
                "clothingItemID": clothingItemID,
                "xCoord": xCoord,
                "yCoord": yCoord
            }
            for clothingItemID, xCoord, yCoord in items
        ]

        return 200, coordinate_data

    except Exception as e:
        return handle_exception(e, "Error accessing database")
