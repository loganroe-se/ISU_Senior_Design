from sqlalchemy_utils import session_handler
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, ClothingItemTag, Image, Item
from sqlalchemy import select, func
from sqlaclhemy.orm import aliased
from datetime import datetime, date

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        item_id = path_params.get('id')

        if not item_id:
            return create_response(400, 'Missing item ID')
        
        status_code, message = getAiRecommendations(item_id)
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting recommendations: {str(e)}")
    

@session_handler
def getAiRecommendations(session, item_id):
    try:
        target_item = aliased(ClothingItemTag)
        matching_item = aliased(ClothingItemTag)

        matching_items = (
            session.query(
                matching_item.clothingItemID
            )
            .join(
                target_item, target_item.tagID == matching_item.tagID
            )
            .filter(
                target_item.clothingItemID == item_id,
                matching_item.clothingItemID != item_id
            )
            .group_by(matching_item.clothingItemID)
            .order_by(func.count().desc())
            .limit(5)
        )

        item_ids = [item.clothingItemID for item in matching_items.all()]

        recommended_posts = (
            session.query(Post)
            .join(Image, Post.postID == Image.postID)  # Join posts to images
            .join(Item, Image.imageID == Item.imageID)  # Join images to items
            .filter(Item.clothingItemID.in_(item_ids))  # Filter posts by the similar items
        ).all()

        if recommended_posts:
            # Create a list of post dictionaries directly
            posts_list = [
                {
                    "postID": post.postID,
                    "userID": post.userID,
                    "status": post.status,
                    "caption": post.caption,
                    "createdDate": (
                        post.createdDate.isoformat()
                        if isinstance(post.createdDate, (datetime, date))
                        else post.createdDate
                    ),
                    "images": [
                        {"imageID": image.imageID, "imageURL": image.imageURL}
                        for image in post.images
                    ],
                    "numLikes": len(post.likes),
                    "numComments": len(post.comments),
                }
                for post in recommended_posts
            ]

            return 200, posts_list
        else:
            return 200, []

    except Exception as e:
        return handle_exception(e, "Error accessing database")




# SELECT 
#     matchingItem.clothingItemID AS similar_item_id,
#     COUNT(*) AS shared_tag_count
# FROM 
#     clothing_item_tags target_item
# JOIN 
#     clothing_item_tags matchingItem
#     ON target_item.tagID = matchingItem.tagID
# WHERE 
#     target_item.clothingItemID = :target_item_id  -- replace or bind this in code
#     AND matchingItem.clothingItemID != :target_item_id
# GROUP BY 
#     matchingItem.clothingItemID
# ORDER BY 
#     shared_tag_count DESC
# LIMIT 5;