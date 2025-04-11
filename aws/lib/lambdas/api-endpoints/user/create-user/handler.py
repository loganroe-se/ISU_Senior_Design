import json
import os
from datetime import date
import boto3
from botocore.exceptions import ClientError
from utils import create_response

# Cognito setup
cognito = boto3.client('cognito-idp')
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']

def handler(event, context):
    try:
        body = json.loads(event['body'])

        username = body.get('username')
        email = body.get('email')
        password = body.get('password')
        dob = body.get('dob')

        if not username or not email or not password or not dob:
            return create_response(400, 'Missing required field')

        # Validate date format
        try:
            date.fromisoformat(dob)
        except ValueError:
            return create_response(400, "Invalid date format. Expected YYYY-MM-DD.")

        # Register user in Cognito
        cognito.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': username},
                # {'Name': 'birthdate', 'Value': dob}
            ]
        )

        return create_response(201, f"User {username} registered successfully. Please confirm your email.")

    except cognito.exceptions.UsernameExistsException:
        return create_response(409, "Email already registered")

    except ClientError as e:
        return create_response(500, f"Cognito error: {e.response['Error']['Message']}")

    except Exception as e:
        return create_response(500, f"Unexpected error during registration: {str(e)}")
