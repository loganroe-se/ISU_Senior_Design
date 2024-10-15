import os
import boto3
import json
from sqlalchemy import create_engine, text

def lambda_handler(event, context):
    try:
        host = os.getenv('DB_ENDPOINT_ADDRESS', '')
        print(f"host: {host}")
        database = os.getenv('DB_NAME', '')
        db_secret_arn = os.getenv('DB_SECRET_ARN', '')
        secret_manager = boto3.client('secretsmanager', region_name='us-east-1')

        secret_params = {
            'SecretId': db_secret_arn
        }
        db_secret = secret_manager.get_secret_value(**secret_params)
        secret_string = db_secret.get('SecretString', '')

        if not secret_string:
            raise ValueError('Secret string is empty')

        secret_data = json.loads(secret_string)
        password = secret_data.get('password', '')

        # Create connection string for SQLAlchemy
        connection_string = f"mysql+pymysql://clusteradmin:{password}@{host}/{database}"

        # Create the SQLAlchemy engine
        engine = create_engine(connection_string)

        # Execute query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT :message AS message"), {'message': 'Hello world!'})
            for row in result:
                print(row['message'])  # Hello world!

    except Exception as e:
        print(f"Error while trying to connect to DB: {e}")
