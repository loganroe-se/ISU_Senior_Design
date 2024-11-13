import os
from sqlalchemy import select
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import Tag

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

# Functions in this file meant to be used elsewhere:
# createTag(tag_val)
# deleteTag(tag_id)
# getTagById(tag_id)
# getTags()
# updateTag(tag_id, tag_val)

def createTag(tag_val):
    # Try to create the tag
    try:
        # Create the session
        session = createSession()

        # Check if the tag already exists
        existing_tag = session.query(Tag).filter(Tag.tag.ilike(tag_val)).first()
        if existing_tag:
            raise Exception("409", f"A tag already exists for the value {tag_val}, with tag ID: {existing_tag.tagID}")
        
        # Create a new tag
        new_tag = Tag(tag=tag_val)

        # Add the tag to the db
        session.add(new_tag)
        session.commit()

        # Return message
        return 201, f"Tag with tagID: {new_tag.tagID} was created successfully"

    except Exception as e:
        code, msg = e.args
        print(f"Tag.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Tag.py Error - Message: {msg}"

    finally:
        if 'session' in locals():
            session.close()


def deleteTag(tag_id):
    # Try to delete the tag
    try:
        # Create the session
        session = createSession()

        # Fetch the tag
        tag = session.execute(select(Tag).where(Tag.tagID == tag_id)).scalars().first()

        if tag:
            session.delete(tag)
            session.commit()

            return 200, f"Tag with tagID: {tag_id} was deleted successfully"
        else:
            return 404, f"Tag with tagID: {tag_id} was not found"

    except Exception as e:
        code, msg = e.args
        print(f"Tag.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Tag.py Error - Message: {msg}"

    finally:
        if 'session' in locals():
            session.close()


def getTagById(tag_id):
    # Try to get the tag
    try:
        # Create the session
        session = createSession()

        # Fetch the tag
        tag = session.execute(select(Tag).where(Tag.tagID == tag_id)).scalars().first()

        if tag:
            # Convert tag to dictionary or JSON-friendly format
            tag_data = {
                'tagID': tag.tagID,
                'tag': tag.tag
            }

            return 200, tag_data
        else:
            return 404, f"Tag with tagID: {tag_id} was not found"

    except Exception as e:
        code, msg = e.args
        print(f"Tag.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Tag.py Error - Message: {msg}"

    finally:
        if 'session' in locals():
            session.close()


def getTags():
    # Try to get all tags
    try:
        # Create the session
        session = createSession()

        # Fetch all tags
        tags = session.execute(select(Tag)).scalars().all()  # Get a list of tag objects

        # Convert tags to dictionary or JSON-friendly format
        tags_data = [{
            'tagID': tag.tagID,
            'tag': tag.tag
        } for tag in tags]

        return 200, tags_data

    except Exception as e:
        code, msg = e.args
        print(f"Tag.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Tag.py Error - Message: {msg}"

    finally:
        if 'session' in locals():
            session.close()


def updateTag(tag_id, tag_val):
    # Try to update the tag
    try:
        # Create the session
        session = createSession()

        # Fetch the tag
        tag = session.execute(select(Tag).where(Tag.tagID == tag_id)).scalars().first()

        if tag:
            # Update tag information
            tag.tag = tag_val

            session.commit()

            return 200, f"Tag with tagID: {tag_id} was updated successfully"
        else:
            return 404, f"Tag with tagID: {tag_id} was not found"

    except Exception as e:
        code, msg = e.args
        print(f"Tag.py Error - Code: {code}, Message: {msg}")
        return int(code), f"Tag.py Error - Message: {msg}"

    finally:
        if 'session' in locals():
            session.close()


def createSession():
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        raise Exception("500", "Error retrieving database credentials")
    
    # Initialize SQLAlchemy engine and session
    session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

    # Return the session
    return session