from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import ClothingItemDetails
from sqlalchemy import select

def handler(event, context):
    try:
        # Get item_id(s) from query string parameters
        query_params = event.get('queryStringParameters') or {}
        raw_item_id = query_params.get('ids')

        if not raw_item_id:
            return create_response(400, 'Missing id query parameter')

        # Split by comma to handle multiple values
        item_ids = [int(i.strip()) for i in raw_item_id.split(',') if i.strip().isdigit()]
        if not item_ids:
            return create_response(400, 'Invalid item_id(s) provided')

        status_code, message = get_item_details(item_ids)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting item details: {str(e)}")


@session_handler
def get_item_details(session, item_ids):
    try:
        # Handle single or multiple IDs
        stmt = select(ClothingItemDetails).where(ClothingItemDetails.clothingItemID.in_(item_ids))
        results = session.execute(stmt).scalars().all()

        if not results:
            return 200, f"No details found for item ID(s): {item_ids}"

        # Return a list of clothing item detail dicts
        items_data = [{
            "clothingItemID": item.clothingItemID,
            "name": item.name,
            "brand": item.brand,
            "category": item.category,
            "price": item.price,
            "itemURL": item.itemURL,
            "size": item.size
        } for item in results]

        return 200, items_data

    except Exception as e:
        return handle_exception(e, "Error accessing database")
