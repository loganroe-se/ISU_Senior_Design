import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import create_session
from dripdrop_orm_objects import ClothingItem

# Example request body
# {
#   "clothing_items": [
#     {
#       "id": 1,
#       "name": "T-Shirt",
#       "brand": "Nike"
#     },
#     {
#       "id": 2,
#       "name": "Jeans",
#       "brand": "Levi's"
#     }
#   ]
# }

def handler(event, context):
    try: 
        # Extract the request body
        body = json.loads(event['body'])

        # Loop over the body to store all the items in a dictionary
        items= {}
        for item in body['clothing_items']:
            items[item['id']] = {
                'name': item['name'],
                'brand': item['brand'],
                'category': item['category'],
                'price': item['price'],
                'itemURL': item['itemURL'],
                'size': item['size']
            }

        status_code, message = populate_clothing_items(items)

        return create_response(status_code, message)
    
    except Exception as e:
        return create_response(500, f"Error updating user: {str(e)}")
    
def populate_clothing_items(items):

    try:
        # Create the session
        session = create_session()

        for item in items:
            # Fetch clothing item object that matches id
            clothing_item = (session.execute(select(ClothingItem).where(ClothingItem.clothingItemID == item.id)).scalars().first())

            clothing_item.name = item['name']
            clothing_item.brand = item['brand']
            clothing_item.category = item['category']
            clothing_item.price = item['price'] 
            clothing_item.itemURL = item['itemURL']
            clothing_item.size = item['size']
    

        # Commit the session
        session.commit()
        
        return 200, f'All tables populated successfully for imageID: {image_id}'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error occurred when updating database")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()
    