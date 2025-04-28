import boto3

# Replace these values with your real setup
USERNAME = "kolbykuc@iastate.edu"
PASSWORD = "@testPassword123!"
CLIENT_ID = "56m910cshqeunar2fdi827r6gd"
USER_POOL_ID = "us-east-1_xb4wypamc"
REGION = "us-east-1"

def get_cognito_token():
    client = boto3.client("cognito-idp", region_name=REGION)

    try:
        response = client.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": USERNAME,
                "PASSWORD": PASSWORD
            },
            ClientId=CLIENT_ID
        )
        return response['AuthenticationResult']['IdToken']
    
    except client.exceptions.NotAuthorizedException:
        print("Incorrect username or password")
    except client.exceptions.UserNotFoundException:
        print("User not found")
    except Exception as e:
        print(f"Error logging in: {e}")
    return None
