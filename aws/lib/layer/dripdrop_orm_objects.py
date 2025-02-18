from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Boolean, Index, UniqueConstraint
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User table
class User(Base):
    __tablename__ = 'users'
    userID = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(50), nullable=False, unique=True)
    password = Column(String(100), nullable=False)
    # Relationships
    posts = relationship("Post", order_by="Post.postID", back_populates="userRel", cascade="all, delete")
    following = relationship("Follow", foreign_keys="Follow.followerId", back_populates="follower", cascade="all, delete")
    followers = relationship("Follow", foreign_keys="Follow.followedId", back_populates="followed", cascade="all, delete")
    has_seen = relationship("HasSeen", back_populates="user")
    likes = relationship("Like", back_populates="user", cascade="all, delete")
    comments = relationship("Comment", back_populates="user", cascade="all, delete")  # Add this line
    profilePic = relationship("ProfilePic", uselist=False, back_populates="user")

# ProfilePic table
class ProfilePic(Base):
    __tablename__ = 'profile_pics'
    profilePicID = Column(Integer, primary_key=True)
    imageURL = Column(String(2000), nullable=False)
    #Establish relationship with user
    user = relationship("User", back_populates="profilePic")

# Following table
class Follow(Base):
    __tablename__ = 'follows'
    # This is the account doing the following
    followerId = Column(Integer, ForeignKey('users.userID'), primary_key=True)
    # This is the account being followed
    followedId = Column(Integer, ForeignKey('users.userID'), primary_key=True)
    # Relationships
    follower = relationship("User", foreign_keys=[followerId], back_populates="following")
    followed = relationship("User", foreign_keys=[followedId], back_populates="followers")

# Post table
class Post(Base):
    __tablename__ = 'posts'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID'))
    caption = Column(String(50))
    isPublic = Column(Boolean, nullable=False, default=False)
    createdDate = Column(Date)
    #Establish relationships
    userRel = relationship("User", back_populates="posts")
    images = relationship("Image", order_by="Image.imageID", back_populates="postRel")
    has_seen = relationship("HasSeen", back_populates="post")
    comments = relationship("Comment", back_populates="post", cascade="all, delete")
    likes = relationship("Like", back_populates="post", cascade="all, delete")

# Has Seen table
class HasSeen(Base):
    __tablename__ = 'has_seen'
    hasSeenID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID'))
    postID = Column(Integer, ForeignKey('posts.postID'))
    timeViewed = Column(Date)

    # Relationships
    user = relationship("User", back_populates="has_seen")
    post = relationship("Post", back_populates="has_seen")

    # Index for userID and postID (faster read times)
    __table_args__ = (
        Index('idx_user_post', 'userID', 'postID'),
    )

# Image table
class Image(Base):
    __tablename__ = 'images'
    imageID = Column(Integer, primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID'))
    imageURL = Column(String(2000), nullable=False)
    #Establish relationship with post
    postRel = relationship("Post", back_populates="images")
    items = relationship("Item", back_populates="image")

# Item table
class Item(Base):
    __tablename__ = 'items'
    imageID = Column(Integer, ForeignKey('images.imageID'), primary_key=True)
    coordinateID = Column(Integer, ForeignKey('coordinates.coordinateID'), unique=True)
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID'), nullable=False)

    # Relationships
    coordinates = relationship("Coordinate", back_populates="item", uselist=False)
    image = relationship("Image", back_populates="items")
    clothingItem = relationship("ClothingItem", back_populates="items")

# Clothing Item Table
class ClothingItem(Base):
    __tablename__ = 'clothing_items'
    clothingItemID = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    brand = Column(String(50), nullable=False)
    category = Column(String(50))
    price = Column(Float)
    itemURL = Column(String(200))
    size = Column(String(5))

    # Relationships
    items = relationship("Item", back_populates="clothingItem")
    clothing_item_tags = relationship("ClothingItemTag", back_populates="clothing_item")

# Coordinates Table
class Coordinate(Base):
    __tablename__ = 'coordinates'
    coordinateID = Column(Integer, primary_key=True)
    xCoord = Column(Integer, nullable=False)
    yCoord = Column(Integer, nullable=False)
    # Relationship with Item (One-to-One)
    item = relationship("Item", back_populates="coordinates", uselist=False)

# Tag table
class Tag(Base):
    __tablename__ = 'tags'
    tagID = Column(Integer, primary_key=True)
    tag = Column(String(100), nullable=False, unique=True)
    # Relationships
    clothing_item_tags = relationship("ClothingItemTag", back_populates="tag")

    @validates('tag')
    def convert_lower(self, key, value):
        return value.lower()
    
class ClothingItemTag(Base):
    __tablename__ = 'clothing_item_tags'
    tagID = Column(Integer, ForeignKey('tags.tagID'), primary_key=True)
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID'), primary_key=True)
    # Relationships
    tag = relationship("Tag", back_populates="clothing_item_tags")
    clothing_item = relationship("ClothingItem", back_populates="clothing_item_tags")

# Comment table
class Comment(Base):
    __tablename__ = 'comments'
    commentID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID'), nullable=False)
    postID = Column(Integer, ForeignKey('posts.postID'), nullable=False)
    content = Column(String(500), nullable=False)
    createdDate = Column(Date, nullable=False)
    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

# Like table
class Like(Base):
    __tablename__ = 'likes'
    userID = Column(Integer, ForeignKey('users.userID'), primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID'), primary_key=True)
    # Relationships
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

