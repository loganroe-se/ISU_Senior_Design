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
    likes = relationship("Like", back_populates="user", cascade="all, delete")

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
    #Establish relationships
    userRel = relationship("User", back_populates="posts")
    images = relationship("Image", order_by="Image.imageID", back_populates="postRel")
    comments = relationship("Comment", back_populates="post", cascade="all, delete")
    likes = relationship("Like", back_populates="post", cascade="all, delete")

# Image table
class Image(Base):
    __tablename__ = 'images'
    imageID = Column(Integer, primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID'))
    imageURL = Column(String(2000), nullable=False)
    #Establish relationship with post
    postRel = relationship("Post", back_populates="images")

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
    createdDate = Column(Date, nullable=False)
    # Relationships
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

# Tag table
class Tag(Base):
    __tablename__ = 'tags'
    tagID = Column(Integer, primary_key=True)
    tag = Column(String(100), nullable=False, unique=True)

    @validates('tag')
    def convert_lower(self, key, value):
        return value.lower()
