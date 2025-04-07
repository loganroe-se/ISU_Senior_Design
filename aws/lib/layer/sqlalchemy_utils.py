__all__ = ['session_scope', 'get_user_by_email', 'get_user_by_sub']

import os
import json
import boto3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dripdrop_orm_objects import Base
from dripdrop_orm_objects import User
from contextlib import contextmanager
from functools import wraps


# Environment variables
DB_ENDPOINT = os.getenv("DB_ENDPOINT")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")

# Cache engine (thread-safe)
_engine = None

def _get_db_credentials(secret_arn):
    secrets_client = boto3.client('secretsmanager')
    try:
        response = secrets_client.get_secret_value(SecretId=secret_arn)
        secret_data = json.loads(response['SecretString'])
        return secret_data
    except Exception as e:
        print(f"Error retrieving secret: {str(e)}")
        return None

def _get_connection_string(user, password, db_endpoint, db_port, db_name):
    return f"mysql+pymysql://{user}:{password}@{db_endpoint}:{db_port}/{db_name}"

def _get_engine():
    global _engine
    if _engine is None:
        creds = _get_db_credentials(DB_SECRET_ARN)
        if not creds:
            raise Exception("500", "Error retrieving database credentials")
        db_url = _get_connection_string(creds['username'], creds['password'], DB_ENDPOINT, DB_PORT, DB_NAME)
        _engine = create_engine(
            db_url,
            echo=False,
            pool_size=1,
            max_overflow=0,
            pool_recycle=3600,
            pool_pre_ping=True,
            pool_use_lifo=True
        )
        # Create tables if needed
        Base.metadata.create_all(_engine)
    return _engine

def _create_session():
    engine = _get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()

@contextmanager
def session_handler(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session = _create_session()
        try:
            result = func(session, *args, **kwargs)
            session.commit()
            return result
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    return wrapper

@session_handler
def get_user_by_email(session, email):
    try:
        return session.query(User).filter_by(email=email).first()
    except Exception as e:
        print(f"Error fetching user by email: {str(e)}")
        return None