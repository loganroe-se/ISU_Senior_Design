import json

def create_response(status_code, body):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json' 
    }
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body)
    }


def handle_exception(error, fileName):
    # Check if there are 2 arguments
    if len(error.args) == 2:
        code, msg = error.args
    else:
        code, msg = 500, str(error)

    # Print out the error
    print(f"{fileName} Error - Code: {code}, Message: {msg}")
    # Return the error
    return int(code), f"{fileName} Error - Message: {msg}"