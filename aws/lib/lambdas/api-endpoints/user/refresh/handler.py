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
        refresh_token = body.get('refresh_token')

        if not refresh_token:
            return create_response(400, "Missing refresh token")

        # ✅ Initiate refresh token auth flow
        response = cognito.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )

        tokens = response['AuthenticationResult']
        id_token = tokens.get('IdToken')
        access_token = tokens.get('AccessToken')

        return create_response(200, {
            'id_token': id_token,
            'access_token': access_token
        })

    except ClientError as e:
        error = e.response['Error']['Message']
        return create_response(401, f"Refresh failed: {error}")

    except Exception as e:
        code, msg = handle_exception(e, "Error refreshing token")
        return create_response(code, msg)
