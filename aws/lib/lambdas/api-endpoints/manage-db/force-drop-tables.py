import os
import json
from sqlalchemy import inspect, text  # Make sure 'text' is imported from SQLAlchemy

from sqlalchemy_utils import create_db_engine, get_connection_string, get_db_credentials
from dripdrop_orm_objects import Base

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def handler(event, context):
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
        engine = create_db_engine(conn_string)
        
        # Disable foreign key checks (MySQL specific)
        with engine.connect() as connection:
            connection.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # Get all table names using SQLAlchemy inspector
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # Drop all tables explicitly
        with engine.connect() as connection:
            for table in tables:
                connection.execute(text(f"DROP TABLE IF EXISTS {table};"))
        
        # Re-enable foreign key checks after dropping tables
        with engine.connect() as connection:
            connection.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
        # Use SQLAlchemy Inspector to get table names (after drop, it should be empty)
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