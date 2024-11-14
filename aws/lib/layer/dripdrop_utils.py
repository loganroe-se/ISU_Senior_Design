import json
import boto3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Session = None

def get_db_credentials(secret_arn):
    secrets_client = boto3.client('secretsmanager')
    try:
        response = secrets_client.get_secret_value(SecretId=secret_arn)
        secret_data = json.loads(response['SecretString'])
        return secret_data
    except Exception as e:
        print(f"Error retrieving secret: {str(e)}")
        return None

def get_connection_string(user, password, db_endpoint, dp_port, dp_name):
    return f"mysql+pymysql://{user}:{password}@{db_endpoint}:{dp_port}/{dp_name}"

def create_db_engine(db_conn_string, debug_mode=False):
    return create_engine(db_conn_string,
                         echo=debug_mode,
                         pool_size=1,
                         max_overflow=0,
                         pool_recycle=3600,
                         pool_pre_ping=True,
                         pool_use_lifo=True)

def create_db_session(engine):
    global Session
    if not Session:
        Session = sessionmaker(bind=engine)
        # todo: setup connection pooling properties
    return Session()

def create_sqlalchemy_engine(user, password, db_endpoint, dp_port, dp_name, debug_mode = False):
    db_url = get_connection_string(user, password, db_endpoint, dp_port, dp_name)
    engine = create_db_engine(db_url, debug_mode)
    Session = create_db_session(engine=engine)
    return Session
