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

# Image table
class Image(Base):
    __tablename__ = 'image'
    imageID = Column(Integer, primary_key=True)
    postID = Column(Integer)
    tagID = Column(Integer, unique=True)
    imageURL = Column(String(2000), nullable=False)