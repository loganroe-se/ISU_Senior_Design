from sqlalchemy import select
from sqlalchemy_utils import create_session
from utils import handle_exception
from dripdrop_orm_objects import Tag

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
        session = create_session()

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
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Tag.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def deleteTag(tag_id):
    # Try to delete the tag
    try:
        # Create the session
        session = create_session()

        # Fetch the tag
        tag = session.execute(select(Tag).where(Tag.tagID == tag_id)).scalars().first()

        if tag:
            session.delete(tag)
            session.commit()

            return 200, f"Tag with tagID: {tag_id} was deleted successfully"
        else:
            return 404, f"Tag with tagID: {tag_id} was not found"

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Tag.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getTagById(tag_id):
    # Try to get the tag
    try:
        # Create the session
        session = create_session()

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
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Tag.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def getTags():
    # Try to get all tags
    try:
        # Create the session
        session = create_session()

        # Fetch all tags
        tags = session.execute(select(Tag)).scalars().all()  # Get a list of tag objects

        # Convert tags to dictionary or JSON-friendly format
        tags_data = [{
            'tagID': tag.tagID,
            'tag': tag.tag
        } for tag in tags]

        return 200, tags_data

    except Exception as e:
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Tag.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()


def updateTag(tag_id, tag_val):
    # Try to update the tag
    try:
        # Create the session
        session = create_session()

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
        # Call a helper to handle the exception
        code, msg = handle_exception(e, "Tag.py")
        return code, msg

    finally:
        if 'session' in locals() and session:
            session.close()