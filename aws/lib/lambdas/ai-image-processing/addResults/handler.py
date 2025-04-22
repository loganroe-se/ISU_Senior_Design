import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Image, ClothingItemTag, Tag, Coordinate, ClothingItem, Item
from sqlalchemy.exc import IntegrityError

def handler(event, context):
    print("Event: ", event)
    for record in event['Records']:
        try:
            print("Adding Classification Results to DB")
            # Step 1: Parse the outer SQS body
            outer_body = json.loads(record['body'])

            # Step 2: Parse the inner JSON in the "body" field
            inner_body = json.loads(outer_body['body'])

            image_path = inner_body.get('image_path')
            clothing_items = inner_body.get('clothing_items', [])

            if not image_path:
                print("Not valid image_path")
                raise Exception("Expected image_path, found: ", image_path)
          
            print("Clothing items: ", clothing_items)

            items = {}
            for item in clothing_items:
                coords = item.get('coordinates', {})
                items[item['item']] = {
                    'x_coordinate': (coords.get('xmin', 0) + coords.get('xmax', 0)) / 2,
                    'y_coordinate': (coords.get('ymin', 0) + coords.get('ymax', 0)) / 2,
                    'attributes': item.get('attributes', {}),
                }

            status_code, message = update_database(image_path, items)

            # Optional: log or handle per-record result
            print(f"Processed image {image_path}: {status_code} - {message}")

        except Exception as e:
            return create_response(500, f"Error updating user: {str(e)}")

            # Optionally handle the failure (e.g., DLQ fallback)

    return {
        "statusCode": 200,
        "body": json.dumps("All messages processed.")
    }


@session_handler   
def update_database(session, image_path, items):
    # Try to update the database
    try:
        # Fetch post id for this image
        # post = (session.execute(select(Post).join(Image).where(Image.imageID == image_id)).scalars().first())
        # if not post:
        #     return 404, f'Post with imageID: {image_id} does not exist'
        print("Updating database")
        image =  session.execute(select(Image).where(Image.imageURL == image_path)).scalars().first()

        if not image:
            return 404, f'Image with imageID: {image_path} does not exist'
        
        # Loop over the items and update the database
        for item in items.values():
            print("Item: ", item)
            new_coordinates = Coordinate(
                xCoord=item['x_coordinate'],
                yCoord=item['y_coordinate']
            )
            session.add(new_coordinates)

            new_clothing_item = ClothingItem()
            session.add(new_clothing_item)

            for tag in item['attributes']:
                new_tag = get_or_create_tag(session, tag)

                if new_tag is None:
                    print(f"⚠️ Skipping invalid tag: {tag}")
                    continue  # Skip if tag creation failed
                new_clothing_item_tag = ClothingItemTag(
                    tagID=new_tag.tagID,
                    clothingItemID=new_clothing_item.clothingItemID
                )
                session.add(new_clothing_item_tag)

            new_item = Item(
                imageID=image.imageID,
                clothingItemID=new_clothing_item.clothingItemID,
                coordinateID=new_coordinates.coordinateID
            )
            session.add(new_item)

        return 200, f'All tables populated successfully for imageID: {image_path}'

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Error occurred when updating database")
        raise Exception(e)


def get_or_create_tag(session, tag_value):
    tag_value = str(tag_value).lower()

    existing_tag = session.execute(
        select(Tag).where(Tag.tag == tag_value)
    ).scalars().first()

    if existing_tag:
        return existing_tag

    new_tag = Tag(tag=tag_value)
    session.add(new_tag)
    session.flush()

    return new_tag
