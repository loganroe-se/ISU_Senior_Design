import json
import os
import boto3
from utils import create_response, handle_exception
from botocore.exceptions import ClientError

# Cognito Client
cognito = boto3.client('cognito-idp')
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']

def handler(event, context):
    try:
        body = json.loads(event['body'])

        email = body.get('email')
        password = body.get('password')

        if not email or not password:
            return create_response(400, 'Missing email or password')

        # Authenticate via Cognito
        auth_result = cognito.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )

        # If auth successful, get tokens
        tokens = auth_result['AuthenticationResult']
        id_token = tokens['IdToken']
        access_token = tokens['AccessToken']
        refresh_token = tokens['RefreshToken']

        # Look up user info in internal DB

        return create_response(200, {
            'id_token': id_token,
            'access_token': access_token,
            'refresh_token': refresh_token
        })

    except ClientError as e:
        error = e.response['Error']['Message']
        return create_response(401, f"Authentication failed: {error}")

    except Exception as e:
        code, msg = handle_exception(e, "Error signing in")
        return create_response(code, msg)