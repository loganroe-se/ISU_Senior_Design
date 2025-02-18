import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";

export class ImageProcessingStepFunctionStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for Storing Image Processing Data
    const imageProcessingTable = new dynamodb.Table(
      this,
      "ImageProcessingTable",
      {
        partitionKey: { name: "image_id", type: dynamodb.AttributeType.STRING },
        tableName: "ImageProcessingTable",
        removalPolicy: cdk.RemovalPolicy.RETAIN, // Change to DESTROY if you want auto-delete
      }
    );

      // 🟢 S3 Bucket for Storing Segmentation Results
      const imageProcessingBucket = new s3.Bucket(this, "ImageProcessingBucket", {
        bucketName: "ai-image-processing-results",
        removalPolicy: cdk.RemovalPolicy.RETAIN, // Change to DESTROY if you want auto-delete
      });
    

    // Queue for incoming image processing requests
    const imageProcessingQueue = new sqs.Queue(this, "ImageProcessingQueue", {
      queueName: "ImageProcessingQueue",
      visibilityTimeout: cdk.Duration.seconds(300), // Should be longer than Step Function execution time
    });

    // Queue for storing classified image results
    const classificationResultsQueue = new sqs.Queue(
      this,
      "ClassificationResultsQueue",
      {
        queueName: "ClassificationResultsQueue",
        visibilityTimeout: cdk.Duration.seconds(300),
      }
    );

    // Segmentation Lambda Function (Docker-based)
    const segmentLambda = new lambda.DockerImageFunction(
      this,
      "SegmentLambda",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/segment"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(30),
      }
    );

    // Classification Lambda Function (Docker-based)
    const classifyLambda = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(30),
      }
    );

    // Grant permissions for SageMaker inference and listing endpoints
    segmentLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sagemaker:InvokeEndpoint", "sagemaker:ListEndpoints"],
        resources: ["*"], // Allows listing all endpoints
      })
    );

    classifyLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sagemaker:InvokeEndpoint", "sagemaker:ListEndpoints"],
        resources: ["*"], // Allows listing all endpoints
      })
    );

    // Grant permissions to Lambdas
    imageProcessingTable.grantWriteData(segmentLambda); // Allow segmentation Lambda to write
    imageProcessingTable.grantReadData(classifyLambda); // Allow classification Lambda to read

     // Grant Permissions for s3 bucket
     imageProcessingBucket.grantPut(segmentLambda); // Segmentation Lambda can upload files to S3
     imageProcessingBucket.grantRead(segmentLambda); // Classification Lambda can read from S3
     imageProcessingTable.grantWriteData(segmentLambda); // Segmentation Lambda can write to DynamoDB
     imageProcessingTable.grantReadData(segmentLambda); // Classification Lambda can read from DynamoDB

     imageProcessingBucket.grantPut(classifyLambda); // Segmentation Lambda can upload files to S3
     imageProcessingBucket.grantRead(classifyLambda); // Classification Lambda can read from S3
     imageProcessingTable.grantWriteData(classifyLambda); // Segmentation Lambda can write to DynamoDB
     imageProcessingTable.grantReadData(classifyLambda); // Classification Lambda can read from DynamoDB

    // Step Function Tasks
    const segmentTask = new tasks.LambdaInvoke(this, "Segment Image", {
      lambdaFunction: segmentLambda,
      outputPath: "$.Payload",
    });

    const classifyTask = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items",
      {
        lambdaFunction: classifyLambda,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    // Task to send classified data to SQS queue
    const sendToSqsTask = new tasks.SqsSendMessage(this, "Send to SQS", {
      queue: classificationResultsQueue,
      messageBody: sfn.TaskInput.fromJsonPathAt("$"),
    });

    // Step Function Definition
    segmentTask.next(classifyTask);
    classifyTask.next(sendToSqsTask);
    const workflow = new sfn.StateMachine(this, "ImageProcessingStateMachine", {
      definitionBody: sfn.DefinitionBody.fromChainable(segmentTask),
      timeout: cdk.Duration.minutes(5),
    });

    // Lambda that triggers Step Function from SQS
    const sqsTriggerLambda = new lambda.Function(this, "SqsTriggerLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "sqs_trigger_lambda.handler",
      code: lambda.Code.fromAsset("lib/lambdas/ai-image-processing/trigger"),
      timeout: cdk.Duration.seconds(30),
      environment: {
        STEP_FUNCTION_ARN: workflow.stateMachineArn,
      },
    });

    // Grant necessary permissions
    imageProcessingQueue.grantConsumeMessages(sqsTriggerLambda);
    sqsTriggerLambda.addEventSource(
      new event_sources.SqsEventSource(imageProcessingQueue)
    );

    workflow.grantStartExecution(sqsTriggerLambda);

    // Grant Step Function permissions to send messages to SQS
    classificationResultsQueue.grantSendMessages(workflow);

    // Grant permissions for SageMaker inference
    segmentLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sagemaker:InvokeEndpoint"],
        resources: ["arn:aws:sagemaker:region:626635444817:endpoint/*"],
      })
    );

    classifyLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sagemaker:InvokeEndpoint"],
        resources: ["arn:aws:sagemaker:region:626635444817:endpoint/*"],
      })
    );
  }
}
