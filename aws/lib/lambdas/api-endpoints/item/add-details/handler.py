import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import ClothingItemDetails, ClothingItem

def handler(event, context):
    try: 
        # Get id from path parameters
        item_id = event['pathParameters'].get('item-id')

        # Check for missing, required values
        if not item_id:
            return create_response(400, 'Missing item ID')
        
        # Extract the request body
        body = json.loads(event['body'])

        # Get all body attributes
        name = body.get('name', None)
        brand = body.get('brand', None)
        category = body.get('category', None)
        price = body.get('price', None)
        itemURL = body.get('itemURL', None)
        size = body.get('size', None)

        status_code, message = add_clothing_item_details(item_id, name, brand, category, price, itemURL, size)

        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    

def add_clothing_item_details(item_id, name, brand, category, price, itemURL, size):

    try:
        # Create the session
        session = create_session()

        clothing_item = session.execute(select(ClothingItem).where(ClothingItem.clothingItemID == item_id)).scalars().first()

        # Check if the clothing item exists
        if not clothing_item:
            return 404, 'Clothing item id does not exist'
        
        if clothing_item.clothingItemDetails:
            return 400, 'Clothing item already has details'
        
        # Create new clothing item details object
        new_clothing_item_details = ClothingItemDetails(
            clothingItemID = item_id, 
            name=name, 
            brand=brand, 
            category=category, 
            price=price, 
            itemURL=itemURL, 
            size=size
        )

        # Add the new clothing item details to the db
        session.add(new_clothing_item_details)
    
        # Commit the session
        session.commit()
        
        return 200, 'All tables populated successfully'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error occurred when updating database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
    