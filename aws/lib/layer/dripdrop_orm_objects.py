from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User table
class User(Base):
    __tablename__ = 'user'
    userID = Column(Integer, primary_key=True)
    username = Column(String(50))
    email = Column(String(50))
    password = Column(String(50))
    wishlistID = Column(Integer, ForeignKey('wishlist.wishlistID'))
    
    wishlist = relationship("Wishlist", back_populates="user")
    saved_posts = relationship("SavedPost", back_populates="user")
    reviews = relationship("Review", back_populates="user")

# Wishlist table
class Wishlist(Base):
    __tablename__ = 'wishlist'
    wishlistID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('user.userID'))
    createdDate = Column(Date)

    user = relationship("User", back_populates="wishlist")
    wishlist_items = relationship("WishlistItem", back_populates="wishlist")

# WishlistItem table
class WishlistItem(Base):
    __tablename__ = 'wishlistitem'
    wishlistItemID = Column(Integer, primary_key=True)
    wishlistID = Column(Integer, ForeignKey('wishlist.wishlistID'))
    itemID = Column(Integer)

    wishlist = relationship("Wishlist", back_populates="wishlist_items")

# SavedPost table
class SavedPost(Base):
    __tablename__ = 'savedposts'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('user.userID'))

    user = relationship("User", back_populates="saved_posts")

# Post table
class Post(Base):
    __tablename__ = 'post'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('user.userID'))
    caption = Column(String(50))
    createdDate = Column(Date)
    imageURL = Column(String(50))
    title = Column(String(50))

    user = relationship("User")
    reviews = relationship("Review", back_populates="post")

# Coupon table
class Coupon(Base):
    __tablename__ = 'coupon'
    couponID = Column(Integer, primary_key=True)
    code = Column(String(50))
    discountType = Column(String(50))
    discountValue = Column(Integer)
    storeID = Column(Integer, ForeignKey('store.storeID'))

    store = relationship("Store", back_populates="coupons")

# Store table
class Store(Base):
    __tablename__ = 'store'
    storeID = Column(Integer, primary_key=True)
    name = Column(String(50))
    websiteURL = Column(String(50))
    logoURL = Column(String(50))

    coupons = relationship("Coupon", back_populates="store")

# ClothingItem table
class ClothingItem(Base):
    __tablename__ = 'clothingitem'
    itemID = Column(Integer, primary_key=True)
    name = Column(String(50))
    brand = Column(String(50))
    category = Column(String(50))
    price = Column(Float)
    discountPrice = Column(Float)
    url = Column(String(50))
    imageURL = Column(String(50))
    color = Column(String(50))
    size = Column(String(50))

    coordinates = relationship("Coordinate", back_populates="clothing_item")

# Coordinate table
class Coordinate(Base):
    __tablename__ = 'coordinates'
    coordinateID = Column(Integer, primary_key=True)
    clothingItemID = Column(Integer, ForeignKey('clothingitem.itemID'))
    type = Column(String(50))
    xCoord = Column(Integer)
    yCoord = Column(Integer)

    clothing_item = relationship("ClothingItem", back_populates="coordinates")

# Review table
class Review(Base):
    __tablename__ = 'review'
    reviewID = Column(Integer, primary_key=True)
    rating = Column(Integer)
    reviewText = Column(String(50))
    productID = Column(Integer, ForeignKey('post.postID'))
    userID = Column(Integer, ForeignKey('user.userID'))
    date = Column(Date)

    user = relationship("User", back_populates="reviews")
    post = relationship("Post", back_populates="reviews")
