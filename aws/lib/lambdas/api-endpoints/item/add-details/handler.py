import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import ClothingItemDetails, ClothingItem

def handler(event, context):
    try: 
        item_id = event['pathParameters'].get('item-id')
        if not item_id:
            return create_response(400, 'Missing item ID')
        
        body = json.loads(event['body'])

        name = body.get('name')
        brand = body.get('brand')
        category = body.get('category')
        price = body.get('price')
        itemURL = body.get('itemURL')
        size = body.get('size')

        status_code, message = add_clothing_item_details(
            item_id, name, brand, category, price, itemURL, size
        )

        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error adding clothing item details: {str(e)}")


@session_handler
def add_clothing_item_details(session, item_id, name, brand, category, price, itemURL, size):
    try:
        clothing_item = session.execute(
            select(ClothingItem).where(ClothingItem.clothingItemID == item_id)
        ).scalars().first()

        if not clothing_item:
            return 404, 'Clothing item ID does not exist'
        
        if clothing_item.details:
            return 400, 'Clothing item already has details'

        new_clothing_item_details = ClothingItemDetails(
            clothingItemID=item_id, 
            name=name, 
            brand=brand, 
            category=category, 
            price=price, 
            itemURL=itemURL, 
            size=size
        )

        session.add(new_clothing_item_details)

        return 200, 'All tables populated successfully'

    except Exception as e:
        return handle_exception(e, "Error occurred when updating database")
