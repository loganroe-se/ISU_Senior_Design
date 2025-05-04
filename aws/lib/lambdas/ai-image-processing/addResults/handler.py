import json
from utils import create_response, handle_exception
from sqlalchemy import select 
from sqlalchemy_utils import session_handler
from dripdrop_orm_objects import Image, ClothingItemTag, Tag, Coordinate, ClothingItem, Item,ClothingItemDetails

def handler(event, context):
    for record in event['Records']:
        try:
            print("Adding Classification Results to DB")
            # Parse SQS record body
            body = json.loads(record['body'])

            image_path = body.get('image_path')
            clothing_items = body.get('clothing_items', [])

            if not image_path:
                print("Not valid image_path")
                raise Exception(f"Expected image_path, found: {image_path}")

            print("Clothing items: ", clothing_items)

            items = []
            seen_names = set()
            for item in clothing_items:
                item_name = item.get('item', 'unknown')
                if item_name in seen_names:
                    continue
                seen_names.add(item_name)

                coords = item.get('coordinates', {})
                items.append({
                    'name': item_name,  # store name explicitly
                    'x_coordinate': (coords.get('xmin', 0) + coords.get('xmax', 0)) / 2,
                    'y_coordinate': (coords.get('ymin', 0) + coords.get('ymax', 0)) / 2,
                    'attributes': item.get('attributes', []),
                })


            status_code, message = update_database(image_path, items)

            print(f"Processed image {image_path}: {status_code} - {message}")

        except Exception as e:
            return create_response(500, f"Error updating user: {str(e)}")

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

        # Get the Post associated with this image
        post = image.postRel  # thanks to the relationship defined in ORM

        if post:
            post.status = "NEEDS_REVIEW"
            print(f"Updated post {post.postID} status to 'Needs Review'")
        else:
            print(f"No post found for image: {image.imageURL}")


        if not image:
            return 404, f'Image with imageID: {image_path} does not exist'
        
        # Loop over the items and update the database
        for item in items:
            item_name = item['name']
            print("Item: ", item)
            new_coordinates = Coordinate(
                xCoord=item['x_coordinate'],
                yCoord=item['y_coordinate']
            )
            session.add(new_coordinates)

            new_clothing_item = ClothingItem()
            session.add(new_clothing_item)
            session.flush()  # required to get clothingItemID

            #Add ClothingItemDetails with `name`
            new_details = ClothingItemDetails(
                clothingItemID=new_clothing_item.clothingItemID,
                name=item_name  # this is the display name like "pants", "shirt", etc.
            )
            session.add(new_details)

            for tag in item['attributes']:
                new_tag = get_or_create_tag(session, tag)

                if new_tag is None:
                    print(f"Skipping invalid tag: {tag}")
                    continue
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
