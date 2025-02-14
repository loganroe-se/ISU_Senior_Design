import json
import boto3
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AWS Step Functions client
sfn_client = boto3.client("stepfunctions")
STATE_MACHINE_ARN = os.getenv("STEP_FUNCTION_ARN")

def start_step_function(image_path):
    """Starts execution of the Step Function with the given image path."""
    try:
        response = sfn_client.start_execution(
            stateMachineArn=STATE_MACHINE_ARN,
            input=json.dumps({"image_path": image_path})
        )
        execution_arn = response.get("executionArn")
        logger.info(f"Started Step Function Execution: {execution_arn}")
        return execution_arn
    except Exception as e:
        logger.error(f"Error starting Step Function: {e}")
        raise

def handler(event, context):
    """AWS Lambda handler to process SQS messages and start Step Function executions."""
    try:
        if "Records" not in event:
            logger.warning("No records found in event.")
            return {"statusCode": 400, "body": json.dumps({"error": "No records in event"})}

        execution_arns = []
        for record in event["Records"]:
            try:
                message_body = json.loads(record["body"])
                image_path = message_body.get("image_path")

                if not image_path:
                    logger.warning(f"Missing 'image_path' in message: {message_body}")
                    continue

                execution_arn = start_step_function(image_path)
                execution_arns.append(execution_arn)

            except json.JSONDecodeError as json_err:
                logger.error(f"JSON parsing error: {json_err}")
            except Exception as process_err:
                logger.error(f"Error processing record: {process_err}")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Step Function started", "executions": execution_arns}),
        }

    except Exception as e:
        logger.error(f"Unhandled error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to process SQS message"}),
        }
