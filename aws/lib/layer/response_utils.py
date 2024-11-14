import json

def create_response(status_code, body):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body)
    }