import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import ClothingItemDetails

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

        status_code, message = update_clothing_item_details(
            item_id, name, brand, category, price, itemURL, size
        )

        return create_response(status_code, message)

    except Exception as e:
        return create_response(500, f"Error updating item: {str(e)}")


@session_handler
def update_clothing_item_details(session, item_id, name, brand, category, price, itemURL, size):
    try:
        clothing_item_details = session.execute(
            select(ClothingItemDetails).where(ClothingItemDetails.clothingItemID == item_id)
        ).scalars().first()

        if not clothing_item_details:
            return 404, 'Clothing item does not have corresponding details record'

        # Only update fields that are provided
        if name:
            clothing_item_details.name = name
        if brand:
            clothing_item_details.brand = brand
        if category:
            clothing_item_details.category = category
        if price is not None:
            clothing_item_details.price = price
        if itemURL:
            clothing_item_details.itemURL = itemURL
        if size:
            clothing_item_details.size = size

        return 200, 'Clothing item details updated successfully'

    except Exception as e:
        return handle_exception(e, "Error occurred when updating database")
