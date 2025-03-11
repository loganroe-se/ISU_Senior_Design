from sqlalchemy_utils import create_session
from utils import create_response, handle_exception
from dripdrop_orm_objects import Item
from sqlalchemy import select

def handler(event, context):
    try:
        # Get id from path parameters
        item_id = event['pathParameters'].get('item-id')

        # Check for missing, required values
        if not item_id:
            return create_response(400, 'Missing item ID')
        
        # Call another function to create the user
        status_code, message = delete_item(item_id)

        # Return message
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error deleting item: {str(e)}")
    

def delete_item(item_id):
    # Try to get the post
    try:
        # Create the session
        session = create_session()

        # Get item from the database
        item = session.execute(select(Item).where(Item.clothingItemID == item_id)).scalars().first()

        # Remove item from the database
        if item:
            session.delete(item)
            session.commit()
            return 200, f"Item with ID {item_id} deleted successfully"
        else:
            return 404, f"Item with ID {item_id} not found"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error accessing database")
        return code, msg

    finally:
        if "session" in locals() and session:
            session.close()