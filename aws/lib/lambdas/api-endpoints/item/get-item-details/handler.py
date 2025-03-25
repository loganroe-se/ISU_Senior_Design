from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import ClothingItemDetails
from sqlalchemy import select

def handler(event, context):
    try:
        # Get id from path parameters
        item_id = event['pathParameters'].get('item-id')

        # Check for missing, required values
        if not item_id:
            return create_response(400, 'Missing item ID')
        
        # Call another function to create the user
        status_code, message = get_item_details(item_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting item details: {str(e)}")
    

def get_item_details(item_id):
    # Try to get the post
    try:
        # Create the session
        session = create_session()

        # Get item from the database
        clothing_item_details = session.execute(select(ClothingItemDetails).where(ClothingItemDetails.clothingItemID == item_id)).scalars().first()

        # Get clothing item details
        if clothing_item_details:
            clothing_item_details_data = {
                "name": clothing_item_details.name,
                "brand": clothing_item_details.brand,
                "category": clothing_item_details.category,
                "price": clothing_item_details.price,
                "itemURL": clothing_item_details.itemURL,
                "size": clothing_item_details.size
            }
            return 200, clothing_item_details_data
        else:
            return 200, f"Clothing item with ID {item_id} does not have details"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()