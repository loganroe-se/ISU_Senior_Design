import os
import json
import pymysql
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
        # Connect to MySQL database using pymysql
        connection = pymysql.connect(
            host=DB_ENDPOINT,
            user=creds['username'],
            password=creds['password'],
            database=DB_NAME,
            port=int(DB_PORT)
        )

        with connection.cursor() as cursor:
            # Disable foreign key checks
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            
            # Drop all tables in the current database
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s", (DB_NAME,))
            tables = cursor.fetchall()

            for table in tables:
                cursor.execute(f"DROP TABLE IF EXISTS `{table[0]}`;")
            
            # Re-enable foreign key checks
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

            connection.commit()

        connection.close()

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