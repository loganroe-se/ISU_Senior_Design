import os
import json
import pymysql
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    try:
        # Get the DB credentials from AWS Secrets Manager
        secret_arn = os.getenv('DB_SECRET_ARN')
        proxy_endpoint = os.getenv('DB_ENDPOINT_ADDRESS')

        secrets_manager = boto3.client('secretsmanager')
        secret_value_response = secrets_manager.get_secret_value(SecretId=secret_arn)
        secret_string = secret_value_response['SecretString']
        secret_dict = json.loads(secret_string)

        db_username = secret_dict['username']
        db_password = secret_dict['password']
        db_name = secret_dict['dbname']
        
        # Connect to the RDS Proxy
        connection = pymysql.connect(
            host=proxy_endpoint,
            user=db_username,
            password=db_password,
            db=db_name,
            connect_timeout=10
        )

        # Sample query
        with connection.cursor() as cursor:
            cursor.execute("SELECT NOW()")
            result = cursor.fetchone()
            print(f"The current time is: {result}")

        connection.close()

        return {
        "statusCode": 200,
        }

    except ClientError as e:
        print(f"Error: {str(e)}")

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
