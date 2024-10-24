import os
import json
from sqlalchemy import inspect
from dripdrop_utils import create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Base

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def manage_db(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Initialize SQLAlchemy session
        conn_string = get_connection_string(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        engine = create_db_engine(conn_string);
        
        result = Base.metadata.create_all(engine)

        #Use SQLAlchemy Inspector to get table names
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        return {
            'statusCode': 200,
            'body': json.dumps(f'Tables in the Database: {tables}')
        }
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Database error: {str(e)}")
        }
