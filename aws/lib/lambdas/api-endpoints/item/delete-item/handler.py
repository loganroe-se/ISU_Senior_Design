from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Item
from sqlalchemy import select

def handler(event, context):
    try:
        item_id = event['pathParameters'].get('item-id')

        if not item_id:
            return create_response(400, 'Missing item ID')

        status_code, message = delete_item(item_id)
        return create_response(status_code, message)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting item: {str(e)}")


@session_handler
def delete_item(session, item_id):
    try:
        item = session.execute(
            select(Item).where(Item.clothingItemID == item_id)
        ).scalars().first()

        if not item:
            return 404, f"Item with ID {item_id} not found"

        session.delete(item)
        return 200, f"Item with ID {item_id} deleted successfully"

    except Exception as e:
        return handle_exception(e, "Error accessing database")
