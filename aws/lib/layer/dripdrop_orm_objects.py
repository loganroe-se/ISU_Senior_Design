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
    #Establish relationship with post
    posts = relationship("Post", order_by="Post.postID", back_populates="userRel", cascade="all, delete")
    follows = relationship("Follow", order_by="Follow.followID", back_populates="userRel")

# Following table
class Follow(Base):
    __tablename__ = 'follows'
    followID = Column(Integer, primary_key=True)
    followerID = Column(Integer, ForeignKey('users.userID'))
    followedID = Column(Integer, nullable=False)
    #Establish relationship with follow
    userRel = relationship("User", order_by="User.userID", back_populates="follows")

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
