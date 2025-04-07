import json
import boto3
import os
from utils import create_response
from botocore.exceptions import ClientError

cognito = boto3.client('cognito-idp')
lambda_client = boto3.client('lambda')
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']
USER_POOL_ID = os.environ['USER_POOL_ID']
INTERNAL_LAMBDA_NAME = os.environ['INTERNAL_USER_LAMBDA_NAME']

def handler(event, context):
    try:
        body = json.loads(event['body'])

        email = body.get('email')
        code = body.get('confirmation_code')
        username = body.get('username')
        dob = body.get('dob')

        if not all([email, code, username, dob]):
            return create_response(400, 'Missing fields')

        #  Confirm in Cognito
        cognito.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )

        #  Get Cognito UUID (sub)
        user_info = cognito.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=email
        )

        user_id = next(
            (attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'sub'),
            None
        )

        if not user_id:
            return create_response(500, "User UUID (sub) not found in Cognito attributes")

        #  Invoke DB Lambda synchronously
        payload = {
            'user_id': user_id,
            'username': username,
            'email': email,
            'dob': dob
        }

        db_response = lambda_client.invoke(
            FunctionName=INTERNAL_LAMBDA_NAME,
            InvocationType='RequestResponse',  # Wait for response
            Payload=json.dumps({ "body": json.dumps(payload) }),
        )

        response_payload = json.load(db_response['Payload'])

        if db_response['StatusCode'] != 200 or response_payload.get('statusCode') != 201:
            # DB insert failed → roll back Cognito
            cognito.admin_delete_user(
                UserPoolId=USER_POOL_ID,
                Username=email
            )
            return create_response(500, "DB insert failed. Cognito user rolled back.")

        #  All succeeded
        return create_response(200, 'User confirmed and stored in DB')

    except cognito.exceptions.CodeMismatchException:
        return create_response(400, 'Invalid confirmation code')

    except cognito.exceptions.ExpiredCodeException:
        return create_response(400, 'Confirmation code expired')

    except ClientError as e:
        return create_response(500, f"AWS error: {e.response['Error']['Message']}")

    except Exception as e:
        return create_response(500, f"Unexpected error: {str(e)}")
