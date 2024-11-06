from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User table
class User(Base):
    __tablename__ = 'users'
    userID = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(50), nullable=False, unique=True)
<<<<<<< HEAD
    password = Column(String(50), nullable=False)
=======
    password = Column(String(100), nullable=False)
    #Establish relationship with post
    posts = relationship("Post", order_by="Post.postID", back_populates="userRel")
    follows = relationship("Follow", order_by="Follow.followID", back_populates="userRel")

# Following table
class Follow(Base):
    __tablename__ = 'follows'
    followID = Column(Integer, primary_key=True)
    followerID = Column(Integer, ForeignKey('users.userID'))
    followedID = Column(Integer, nullable=False)
    #Establish relationship with follow
    userRel = relationship("User", order_by="User.userID", back_populates="follows")
>>>>>>> master

# Post table
class Post(Base):
    __tablename__ = 'posts'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID'))
    caption = Column(String(50), nullable=False)
    createdDate = Column(Date)
    imageURL = Column(String(50), nullable=False)
    #Establish relationship with user
    userRel = relationship("User", back_populates="posts")

# Image table
class Image(Base):
    __tablename__ = 'image'
    imageID = Column(Integer, primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID'))
    imageURL = Column(String(2000), nullable=False)
    #Establish relationship with post
    posts = relationship("Post", order_by="Post.postID", back_populates="userRel")
