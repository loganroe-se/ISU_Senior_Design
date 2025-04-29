import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CfnOutput } from "aws-cdk-lib";

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
        timeout: cdk.Duration.seconds(900),
      }
    );

    // Classification Lambda Function (Docker-based)
    const classifyLambda1 = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda1",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(900),
        environment: {
          MODEL_NAME: "models/classify1.pt",
        },
      }
    );

    const classifyLambda2 = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda2",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(900),
        environment: {
          MODEL_NAME: "models/classify2.pt",
        },
      }
    );

    const classifyLambda3 = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda3",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(900),
        environment: {
          MODEL_NAME: "models/classify3.pt",
        },
      }
    );

    const classifyLambda4 = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda4",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(900),
        environment: {
          MODEL_NAME: "models/classify4.pt",
        },
      }
    );

    const classifyLambda5 = new lambda.DockerImageFunction(
      this,
      "ClassifyLambda5",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "lib/lambdas/ai-image-processing/classification"
        ),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        timeout: cdk.Duration.seconds(900),
        environment: {
          MODEL_NAME: "models/classify5.pt",
        },
      }
    );

    // Grant permissions to Lambdas
    imageProcessingTable.grantWriteData(segmentLambda); // Allow segmentation Lambda to write

    // Grant Permissions for s3 bucket
    imageProcessingBucket.grantPut(segmentLambda); // Segmentation Lambda can upload files to S3
    imageProcessingBucket.grantRead(segmentLambda); // Classification Lambda can read from S3
    imageProcessingTable.grantWriteData(segmentLambda); // Segmentation Lambda can write to DynamoDB
    imageProcessingTable.grantReadData(segmentLambda); // Classification Lambda can read from DynamoDB

    imageProcessingTable.grantReadData(classifyLambda1);
    imageProcessingTable.grantReadData(classifyLambda2);
    imageProcessingTable.grantReadData(classifyLambda3);
    imageProcessingTable.grantReadData(classifyLambda4);
    imageProcessingTable.grantReadData(classifyLambda5);

    imageProcessingBucket.grantRead(classifyLambda1);
    imageProcessingBucket.grantRead(classifyLambda2);
    imageProcessingBucket.grantRead(classifyLambda3);
    imageProcessingBucket.grantRead(classifyLambda4);
    imageProcessingBucket.grantRead(classifyLambda5);

    imageProcessingBucket.grantPut(classifyLambda1);
    imageProcessingBucket.grantPut(classifyLambda2);
    imageProcessingBucket.grantPut(classifyLambda3);
    imageProcessingBucket.grantPut(classifyLambda4);
    imageProcessingBucket.grantPut(classifyLambda5);

    // Step Function Tasks
    const segmentTask = new tasks.LambdaInvoke(this, "Segment Image", {
      lambdaFunction: segmentLambda,
      outputPath: "$.Payload",
    });

    const classifyTask1 = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items 1",
      {
        lambdaFunction: classifyLambda1,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    const classifyTask2 = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items 2",
      {
        lambdaFunction: classifyLambda2,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    const classifyTask3 = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items 3",
      {
        lambdaFunction: classifyLambda1,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    const classifyTask4 = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items 4",
      {
        lambdaFunction: classifyLambda2,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    const classifyTask5 = new tasks.LambdaInvoke(
      this,
      "Classify Segmented Items 5",
      {
        lambdaFunction: classifyLambda1,
        inputPath: "$",
        outputPath: "$.Payload",
      }
    );

    const mergeClassificationsLambda = new lambda.Function(
      this,
      "MergeClassificationsLambda",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "merge.handler",
        code: lambda.Code.fromAsset("lib/lambdas/ai-image-processing/merge"),
      }
    );

    const mergeResultsTask = new tasks.LambdaInvoke(this, "Merge Classification Results", {
      lambdaFunction: mergeClassificationsLambda,
      inputPath: "$",
      outputPath: "$.Payload",
    });
    

    // Task to send classified data to SQS queue
    const sendToSqsTask = new tasks.SqsSendMessage(this, "Send to SQS", {
      queue: classificationResultsQueue,
      messageBody: sfn.TaskInput.fromJsonPathAt("$"),
    });

    // Step Function Definition
    const classificationParallel = new sfn.Parallel(
      this,
      "Run Multiple Classifications"
    );

    classificationParallel.branch(classifyTask1);
    classificationParallel.branch(classifyTask2);
    classificationParallel.branch(classifyTask3);
    classificationParallel.branch(classifyTask4);
    classificationParallel.branch(classifyTask5);

    segmentTask
      .next(classificationParallel)
      .next(mergeResultsTask)
      .next(sendToSqsTask);

    const workflow = new sfn.StateMachine(this, "ImageProcessingStateMachine", {
      definitionBody: sfn.DefinitionBody.fromChainable(segmentTask),
      timeout: cdk.Duration.minutes(10),
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

    new CfnOutput(this, "ImageProcessingQueueArn", {
      value: imageProcessingQueue.queueArn,
      exportName: "ImageProcessingQueueArn",
    });

    new CfnOutput(this, "ImageProcessingQueueUrl", {
      value: imageProcessingQueue.queueUrl,
      exportName: "ImageProcessingQueueUrl",
    });

    new cdk.CfnOutput(this, "ClassificationResultsQueueArn", {
      value: classificationResultsQueue.queueArn,
      exportName: "ClassificationResultsQueueArn",
    });

    new cdk.CfnOutput(this, "ClassificationResultsQueueUrl", {
      value: classificationResultsQueue.queueUrl,
      exportName: "ClassificationResultsQueueUrl",
    });
  }
}
