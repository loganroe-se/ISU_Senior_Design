import os
import json
from sqlalchemy import sessionmaker, select

from dripdrop_utils import create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import User

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def get_users(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Initialize SQLAlchemy engine and session
        conn_string = get_connection_string(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        engine = create_db_engine(conn_string)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Fetch all users
        users = session.execute(select(User))

        # Return message
        return {
            'statusCode': 201,
            'body': json.dumps({users})
        }
    
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving userss: {str(e)}")
        }
    
    finally:
        session.close()