from sqlalchemy_utils import session_handler, get_user_by_email
from utils import create_response, handle_exception
from dripdrop_orm_objects import Post, ClothingItemTag, Image, Item, ClothingItemDetails
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

        # Get the original color and type
        item_details = (
            session.query(
                ClothingItemDetails.red,
                ClothingItemDetails.green,
                ClothingItemDetails.blue,
                ClothingItemDetails.itemType
            )
            .filter(ClothingItemDetails.clothingItemID == item_id)
            .first()
        )

        if not item_details:
            return 404, "Original item details not found"

        target_red, target_green, target_blue, target_type = item_details
        tolerance = 40

        def fetch_recommendations(with_color=True):
            query = (
                session.query(Post)
                .join(Image, Post.postID == Image.postID)
                .join(Item, Image.imageID == Item.imageID)
                .join(matching_item, matching_item.clothingItemID == Item.clothingItemID)
                .join(target_item, target_item.tagID == matching_item.tagID)
                .join(ClothingItemDetails, ClothingItemDetails.clothingItemID == matching_item.clothingItemID)
                .filter(
                    target_item.clothingItemID == item_id,
                    matching_item.clothingItemID != item_id,
                    Post.status.ilike("public"),
                    Post.postID != original_post_id,
                    ClothingItemDetails.itemType == target_type  # filter by same type
                )
            )

            if with_color:
                query = query.filter(
                    ClothingItemDetails.red.between(target_red - tolerance, target_red + tolerance),
                    ClothingItemDetails.green.between(target_green - tolerance, target_green + tolerance),
                    ClothingItemDetails.blue.between(target_blue - tolerance, target_blue + tolerance),
                )

            return (
                query.group_by(Post.postID)
                .having(func.count(matching_item.tagID) >= 2)
                .order_by(desc(func.count(matching_item.tagID)))
                .limit(25)
                .all()
            )

        # First try with color + type filtering
        recommended_posts = fetch_recommendations(with_color=True)

        # If none found, retry without color but still enforce same type
        if not recommended_posts:
            print("No color-matching posts found, falling back to type-only matching.")
            recommended_posts = fetch_recommendations(with_color=False)

        if recommended_posts:
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

        return 200, []

    except Exception as e:
        return handle_exception(e, "Error accessing database")
