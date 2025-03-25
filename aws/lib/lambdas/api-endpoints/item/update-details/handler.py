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

        status_code, message = update_clothing_item_details(item_id, name, brand, category, price, itemURL, size)

        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    

def update_clothing_item_details(item_id, name, brand, category, price, itemURL, size):

    try:
        # Create the session
        session = create_session()

        # Fetch the clothing item details from the database
        clothing_item_details = session.execute(select(ClothingItemDetails).where(ClothingItemDetails.clothingItemID == item_id)).scalars().first()

        # Check if the clothing item exists
        if not clothing_item_details:
            return 404, 'Clothing item does not have corresponding details record'
        
        # Update the clothing item details
        if name:
            clothing_item_details.name = name
        if brand:
            clothing_item_details.brand = brand
        if category:
            clothing_item_details.category = category
        if price is not None:  # Ensure price can be zero as valid input
            clothing_item_details.price = price
        if itemURL:
            clothing_item_details.itemURL = itemURL
        if size:
            clothing_item_details.size = size
    
        # Commit the session
        session.commit()
        
        return 200, 'Clothing item details updated successfully'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error occurred when updating database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
    