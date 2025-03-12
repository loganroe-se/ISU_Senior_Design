import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import Item, Coordinate, ClothingItem, ClothingItemDetails

def handler(event, context):
    try: 
        # Extract the request body
        body = json.loads(event['body'])

         # Get all body attributes
        image_id = body.get('image_id')
        xCoord = body.get('xCoord')
        yCoord = body.get('yCoord')
        name = body.get('name', None)
        brand = body.get('brand', None)
        category = body.get('category', None)
        price = body.get('price', None)
        itemURL = body.get('itemURL', None)
        size = body.get('size', None)
        
        # Call helper function
        status_code, message = create_clothing_item(image_id, xCoord, yCoord, name, brand, category, price, itemURL, size)

        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    

def create_clothing_item(image_id, xCoord, yCoord, name, brand, category, price, itemURL, size):

    try:
        # Create the session
        session = create_session()

        # Create the new tables
        new_coordinates = Coordinate(xCoord=xCoord, yCoord=yCoord)
        session.add(new_coordinates)

        new_clothing_item = ClothingItem()
        session.add(new_clothing_item)
        session.flush()

        new_item = Item(imageID = image_id, clothingItemID = new_clothing_item.clothingItemID, coordinateID = new_coordinates.coordinateID)
        session.add(new_item)

        new_clothing_item_details = ClothingItemDetails(
            clothingItemID = new_clothing_item.clothingItemID, 
            name=name, 
            brand=brand, 
            category=category, 
            price=price, 
            itemURL=itemURL, 
            size=size
        )
        session.add(new_clothing_item_details)
    
        # Commit the session
        session.commit()
        
        return 200, 'All tables populated successfully'

    except Exception as e:
        # Call a helper to handle the exception
        session.rollback()
        code, msg = handle_exception(e, "Error occurred when updating database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
    