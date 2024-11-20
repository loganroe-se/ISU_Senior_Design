from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
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
    #Relationships
    posts = relationship("Post", order_by="Post.postID", back_populates="userRel", cascade="all, delete")
    following = relationship("Follow", order_by="Follow.followerId", back_populates="follower", cascade="all, delete orphan")
    followers = relationship("Follow", order_by="Follow.followedId", back_populates="followed", cascade="all, delete orphan")

# Following table
class Follow(Base):
    __tablename__ = 'follows'
    followId = Column(Integer, primary_key=True)
    followerId = Column(Integer, ForeignKey('users.userID'), nullable=False)
    followedId = Column(Integer, ForeignKey('users.userID'), nullable=False)
    #Relationships
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

# Tag table
class Tag(Base):
    __tablename__ = 'tags'
    tagID = Column(Integer, primary_key=True)
    tag = Column(String(100), nullable=False, unique=True)

    @validates('tag')
    def convert_lower(self, key, value):
        return value.lower()
