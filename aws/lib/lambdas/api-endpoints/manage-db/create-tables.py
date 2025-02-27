import os
import json
from sqlalchemy import inspect
from sqlalchemy_utils import create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Base
from dripdrop_orm_objects import Post
from utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def handler(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    if not creds:
        return create_response(500, 'Error retrieving database credentials')
    
    try:
        # Initialize SQLAlchemy session
        conn_string = get_connection_string(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        engine = create_db_engine(conn_string)
        
        result = Base.metadata.create_all(engine)

        #Use SQLAlchemy Inspector to get table names
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        return create_response(200, f'Tables in the Database: {tables}')
   
    except Exception as e:
        print(f"Database error: {e}")
        return create_response(500, f"Database error: {str(e)}")
