import os
import json
import boto3
from sqlalchemy import text

from dripdrop_utils import create_sqlalchemy_engine

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

# Function to retrieve database credentials from AWS Secrets Manager
def get_db_credentials():
    secrets_client = boto3.client('secretsmanager')
    try:
        response = secrets_client.get_secret_value(SecretId=DB_SECRET_ARN)
        secret_data = json.loads(response['SecretString'])
        return secret_data
    except Exception as e:
        print(f"Error retrieving secret: {str(e)}")
        return None


def lambda_handler(event, context):
    # Get database credentials
    creds = get_db_credentials()
    
    if not creds:
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving database credentials')
        }
    
    try:
        # Initialize SQLAlchemy session
        session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME);
        
        # Example query
        result = session.execute(text("SELECT 'Connected to Aurora MySQL via SQLAlchemy';")).fetchone()
        
        session.close()

        return {
            'statusCode': 200,
            'body': json.dumps(f'Database Response: {result}')
        }
    except Exception as e:
        print(f"Database connection error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Database connection error: {str(e)}")
        }
