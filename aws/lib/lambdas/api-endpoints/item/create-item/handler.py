import json
from utils import create_response, handle_exception
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Item, Coordinate, ClothingItem, ClothingItemDetails

def handler(event, context):
    try: 
        body = json.loads(event['body'])

        image_id = body.get('image_id')
        xCoord = body.get('xCoord')
        yCoord = body.get('yCoord')
        name = body.get('name')
        brand = body.get('brand')
        category = body.get('category')
        price = body.get('price')
        itemURL = body.get('itemURL')
        size = body.get('size')

        status_code, message = create_clothing_item(
            image_id, xCoord, yCoord, name, brand, category, price, itemURL, size
        )

        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error creating clothing item: {str(e)}")


@session_handler
def create_clothing_item(session, image_id, xCoord, yCoord, name, brand, category, price, itemURL, size):
    try:
        new_coordinates = Coordinate(xCoord=xCoord, yCoord=yCoord)
        session.add(new_coordinates)

        new_clothing_item = ClothingItem()
        session.add(new_clothing_item)
        session.flush()  # So we can access clothingItemID before commit

        new_item = Item(
            imageID=image_id,
            clothingItemID=new_clothing_item.clothingItemID,
            coordinateID=new_coordinates.coordinateID
        )
        session.add(new_item)

        new_clothing_item_details = ClothingItemDetails(
            clothingItemID=new_clothing_item.clothingItemID,
            name=name,
            brand=brand,
            category=category,
            price=price,
            itemURL=itemURL,
            size=size
        )
        session.add(new_clothing_item_details)

        return create_response(200, {"itemId": {new_item.clothingItemID}, "message": "All tables populated successfully"})

    except Exception as e:
        return handle_exception(e, "Error occurred when creating clothing item")
