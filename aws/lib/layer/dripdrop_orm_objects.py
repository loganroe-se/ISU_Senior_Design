from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, UniqueConstraint
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
    createdDate = Column(Date)
    #Establish relationship with user
    userRel = relationship("User", back_populates="posts")
    #Establish relationship with image
    images = relationship("Image", order_by="Image.imageID", back_populates="postRel")

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
    coordinateID = Column(Integer, ForeignKey('coordinates.coordinateID'), unique=True)
    imageID = Column(Integer, ForeignKey('images.imageID'), nullable=False)
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID'), nullable=False)

    # Relationships
    coordinates = relationship("Coordinates", uselist=False)
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

    # Relationship with Items
    items = relationship("Item", back_populates="clothingItem")

# Coordinates Table
class Coordinate(Base):
    __tablename__ = 'coordinates'
    coordinateID = Column(Integer, primary_key=True)
    xCoord = Column(Integer, nullable=False)
    yCoord = Column(Integer, nullable=False)

# Tag table
class Tag(Base):
    __tablename__ = 'tags'
    tagID = Column(Integer, primary_key=True)
    tag = Column(String(100), nullable=False, unique=True)

    @validates('tag')
    def convert_lower(self, key, value):
        return value.lower()
