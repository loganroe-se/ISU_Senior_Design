from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Boolean, Index, UniqueConstraint
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User table
class User(Base):
    __tablename__ = 'users'
    userID = Column(Integer, primary_key=True)
    uuid = Column(String(200), nullable=False, unique=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(50), nullable=False, unique=True)
    profilePicURL = Column(String(2000), default="profilePics/default.jpg")
    accountType = Column(String(10), nullable=False, default="USER_FREE")
    dob = Column(Date, nullable=False)

    posts = relationship("Post", back_populates="userRel", cascade="all, delete-orphan")
    following = relationship("Follow", foreign_keys="Follow.followerId", back_populates="follower", cascade="all, delete-orphan")
    followers = relationship("Follow", foreign_keys="Follow.followedId", back_populates="followed", cascade="all, delete-orphan")
    has_seen = relationship("HasSeen", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", uselist=False, back_populates="user", cascade="all, delete-orphan", single_parent=True)
    
class UserProfile(Base):
    __tablename__ = 'user_profiles'
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), primary_key=True)

    firstName = Column(String(50))
    lastName = Column(String(50))
    bio = Column(String(1000))
    location = Column(String(100))
    website = Column(String(200))
    gender = Column(String(20))  # optional: male, female, non-binary, etc.
    phoneNumber = Column(String(20))  # optional: for discoverability or security
    isPrivate = Column(Boolean, default=False)  # true = account is private
    profileTheme = Column(String(20), default="default")  # e.g., light/dark/custom
    language = Column(String(10), default="en")  # user preferred language

    # Relationships
    user = relationship("User", back_populates="profile")


# Follow table
class Follow(Base):
    __tablename__ = 'follows'
    followerId = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), primary_key=True)
    followedId = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), primary_key=True)

    follower = relationship("User", foreign_keys=[followerId], back_populates="following")
    followed = relationship("User", foreign_keys=[followedId], back_populates="followers")

# Post table
class Post(Base):
    __tablename__ = 'posts'
    postID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"))
    caption = Column(String(50))
    status = Column(String(15), nullable=False, default="PRIVATE")
    createdDate = Column(Date)

    userRel = relationship("User", back_populates="posts")
    images = relationship("Image", back_populates="postRel", cascade="all, delete-orphan")
    has_seen = relationship("HasSeen", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="post", cascade="all, delete-orphan")


# HasSeen table
class HasSeen(Base):
    __tablename__ = 'has_seen'
    hasSeenID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"))
    postID = Column(Integer, ForeignKey('posts.postID', ondelete="CASCADE"))
    timeViewed = Column(Date)

    user = relationship("User", back_populates="has_seen")
    post = relationship("Post", back_populates="has_seen")

    __table_args__ = (
        Index('idx_user_post', 'userID', 'postID'),
    )

# Image table
class Image(Base):
    __tablename__ = 'images'
    imageID = Column(Integer, primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID', ondelete="CASCADE"))
    imageURL = Column(String(2000), nullable=False)

    postRel = relationship("Post", back_populates="images")
    items = relationship("Item", back_populates="image", cascade="all, delete-orphan")

# Item table
class Item(Base):
    __tablename__ = 'items'
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID', ondelete="CASCADE"), primary_key=True)
    coordinateID = Column(Integer, ForeignKey('coordinates.coordinateID', ondelete="CASCADE"), unique=True)
    imageID = Column(Integer, ForeignKey('images.imageID', ondelete="CASCADE"))

    coordinates = relationship("Coordinate", back_populates="item", uselist=False, cascade="all, delete-orphan", single_parent=True)
    image = relationship("Image", back_populates="items")
    clothingItem = relationship("ClothingItem", back_populates="item", uselist=False, cascade="all, delete-orphan", single_parent=True)

# ClothingItem table
class ClothingItem(Base):
    __tablename__ = 'clothing_items'
    clothingItemID = Column(Integer, primary_key=True, autoincrement=True)

    item = relationship("Item", back_populates="clothingItem", uselist=False, cascade="all, delete-orphan")
    clothing_item_tags = relationship("ClothingItemTag", back_populates="clothing_item", cascade="all, delete-orphan")
    details = relationship("ClothingItemDetails", back_populates="clothing_item", uselist=False, cascade="all, delete-orphan", single_parent=True)

# ClothingItemDetails table
# ClothingItemDetails table
class ClothingItemDetails(Base):
    __tablename__ = 'clothing_item_details'
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID', ondelete="CASCADE"), primary_key=True)
    name = Column(String(50))
    brand = Column(String(50))
    category = Column(String(50))
    price = Column(Float)
    itemURL = Column(String(200))
    size = Column(String(5))

    # NEW: RGB color
    red = Column(Integer)
    green = Column(Integer)
    blue = Column(Integer)

    itemType = Column(String(50))

    clothing_item = relationship("ClothingItem", back_populates="details")

# Coordinate table
class Coordinate(Base):
    __tablename__ = 'coordinates'
    coordinateID = Column(Integer, primary_key=True)
    xCoord = Column(Float, nullable=False)
    yCoord = Column(Float, nullable=False)

    item = relationship("Item", back_populates="coordinates", uselist=False)

# Tag table
class Tag(Base):
    __tablename__ = 'tags'
    tagID = Column(Integer, primary_key=True)
    tag = Column(String(100), nullable=False, unique=True)

    clothing_item_tags = relationship("ClothingItemTag", back_populates="tag")

    @validates('tag')
    def convert_lower(self, key, value):
        return value.lower()

# ClothingItemTag table
class ClothingItemTag(Base):
    __tablename__ = 'clothing_item_tags'
    tagID = Column(Integer, ForeignKey('tags.tagID', ondelete="CASCADE"), primary_key=True)
    clothingItemID = Column(Integer, ForeignKey('clothing_items.clothingItemID', ondelete="CASCADE"), primary_key=True)

    tag = relationship("Tag", back_populates="clothing_item_tags")
    clothing_item = relationship("ClothingItem", back_populates="clothing_item_tags")

# Comment table
class Comment(Base):
    __tablename__ = 'comments'
    commentID = Column(Integer, primary_key=True)
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), nullable=False)
    postID = Column(Integer, ForeignKey('posts.postID', ondelete="CASCADE"), nullable=False)
    content = Column(String(500), nullable=False)
    createdDate = Column(Date, nullable=False)

    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

# Like table
class Like(Base):
    __tablename__ = 'likes'
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID', ondelete="CASCADE"), primary_key=True)

    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

# Bookmark table
class Bookmark(Base):
    __tablename__ = 'bookmarks'
    userID = Column(Integer, ForeignKey('users.userID', ondelete="CASCADE"), primary_key=True)
    postID = Column(Integer, ForeignKey('posts.postID', ondelete="CASCADE"), primary_key=True)

    user = relationship("User", back_populates="bookmarks")
    post = relationship("Post", back_populates="bookmarks")