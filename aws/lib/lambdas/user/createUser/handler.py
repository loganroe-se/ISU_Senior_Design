import os
import json
from sqlalchemy.exc import IntegrityError
from dripdrop_utils import create_sqlalchemy_engine, get_db_credentials
from dripdrop_orm_objects import User
from response_utils import create_response

# Fetch environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT_ADDRESS")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

def createUser(event, context):
    # Get database credentials
    creds = get_db_credentials(DB_SECRET_ARN)
    
    # Check credentials
    if not creds:
        # return {
        #     'statusCode': 500,
        #     'headers': {
        #             'Access-Control-Allow-Origin': '*',
        #             'Access-Control-Allow-Headers': 'Content-Type'
        #     },
        #     'body': json.dumps('Error retrieving database credentials')
        # }
        return create_response(500, 'Error retrieving database credentials')

    
    try:
        # Parse the user data from event
        body = json.loads(event['body'])
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        if not username or not email or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps('Missing required field')
            }
        
        try:
            # Initialize SQLAlchemy engine and session
            session = create_sqlalchemy_engine(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)

            # Create a new user
            new_user = User(username=username, email=email, password=password)

            # Add the user to the db
            session.add(new_user)
            session.commit()

            # Return message
            # return {
            #     'statusCode': 201,
            #     'headers': {
            #         'Access-Control-Allow-Origin': '*',
            #         'Access-Control-Allow-Headers': 'Content-Type'
            #     },
            #     'body': json.dumps(f'User {username} created successfully')
            # }
            create_response(201, "THIS IS FROM MY TEST: User {username} created successfully")
        
        finally:
            session.close()

    except IntegrityError as e:
        session.rollback()
        
        # Check for duplicate email or username in the error message
        if 'email' in str(e.orig):
            error_message = 'Email already exists'
        elif 'username' in str(e.orig):
            error_message = 'Username already exists'
        else:
            error_message = 'Duplicate entry'

        return {
            'statusCode': 409,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(error_message)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            'body': json.dumps(f"Error Creating User: {str(e)}")
        }