from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User table
class User(Base):
    __tablename__ = 'user'
    userID = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(50), nullable=False, unique=True)
    password = Column(String(50), nullable=False)

# Post table
class Post(Base):
    __tablename__ = 'post'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('user.userID'))
    caption = Column(String(50), nullable=False)
    createdDate = Column(Date)
    imageURL = Column(String(50), nullable=False)
    #user = relationship("User")
    #reviews = relationship("Review", back_populates="post")