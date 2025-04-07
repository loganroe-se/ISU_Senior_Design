from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import ClothingItemDetails
from sqlalchemy import select

def handler(event, context):
    try:
        # Get item ID from path parameters
        item_id = event['pathParameters'].get('item-id')

        if not item_id:
            return create_response(400, 'Missing item ID')

        status_code, message = get_item_details(item_id)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting item details: {str(e)}")


@session_handler
def get_item_details(session, item_id):
    try:
        clothing_item_details = session.execute(
            select(ClothingItemDetails).where(ClothingItemDetails.clothingItemID == item_id)
        ).scalars().first()

        if not clothing_item_details:
            return 200, f"Clothing item with ID {item_id} does not have details"

        clothing_item_details_data = {
            "name": clothing_item_details.name,
            "brand": clothing_item_details.brand,
            "category": clothing_item_details.category,
            "price": clothing_item_details.price,
            "itemURL": clothing_item_details.itemURL,
            "size": clothing_item_details.size
        }

        return 200, clothing_item_details_data

    except Exception as e:
        return handle_exception(e, "Error accessing database")
