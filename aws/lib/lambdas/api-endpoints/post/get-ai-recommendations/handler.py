from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, ClothingItemTag, Image, Item
from sqlalchemy import select, func, desc
from sqlalchemy.orm import aliased
from datetime import datetime, date

def handler(event, context):
    try:
        path_params = event.get('pathParameters') or {}
        item_id = path_params.get('id')

        if not item_id:
            return create_response(400, 'Missing item ID')

        email = event['requestContext']['authorizer']['claims']['email']
        
        status_code, message = getAiRecommendations(email, item_id)
        return create_response(status_code, message)
    
    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, f"Error getting recommendations: {str(e)}")
    

@session_handler
def getAiRecommendations(session, email, item_id):
    user = get_user_by_email(session, email)
    userID = user.userID

    try:
        target_item = aliased(ClothingItemTag)
        matching_item = aliased(ClothingItemTag)

        original_post_id = (
            session.query(Post.postID)
            .join(Image, Post.postID == Image.postID)
            .join(Item, Image.imageID == Item.imageID)
            .filter(Item.clothingItemID == item_id)
            .scalar()
        )

        if not original_post_id:
            return 404, "Original post not found for the given item ID"


        recommended_posts = (
            session.query(Post)
            .join(Image, Post.postID == Image.postID)
            .join(Item, Image.imageID == Item.imageID)
            .join(matching_item, matching_item.clothingItemID == Item.clothingItemID)
            .join(target_item, target_item.tagID == matching_item.tagID)
            .filter(
                target_item.clothingItemID == item_id,
                matching_item.clothingItemID != item_id,
                Post.status.ilike("public"),
                Post.postID != original_post_id
            )
            .group_by(Post.postID)
            .having(func.count(matching_item.tagID) >= 3)
            .order_by(desc(func.count(matching_item.tagID)))
            .limit(5)  # or however many posts you want
            .all()
        )

        if recommended_posts:
            # Create a list of post dictionaries directly
            posts_list = [
                {
                    "postID": post.postID,
                    "uuid": post.userRel.uuid,
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
                    "user": {
                        "username": post.userRel.username,
                        "profilePic": post.userRel.profilePicURL,
                    },
                    "userHasLiked": int(userID) in {like.userID for like in post.likes},
                    "userHasSaved": int(userID) in {bookmark.userID for bookmark in post.bookmarks},
                }
                for post in recommended_posts
            ]

            return 200, posts_list
        else:
            return 200, []

    except Exception as e:
        return handle_exception(e, "Error accessing database")



# SQL Query for reference:

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