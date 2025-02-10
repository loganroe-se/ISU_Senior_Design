import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import { Aws, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';

export class YOLOv8SageMakerStack extends Stack {
    private readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const region = Aws.REGION;
        const account = Aws.ACCOUNT_ID;

        // Create S3 bucket
        this.bucket = new s3.Bucket(this, "yolov8-s3", {
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // IAM Roles
        // Create role for Notebook instance
        const nRole = new iam.Role(this, "yolov8-notebookAccessRole", {
            assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
        });

        // Attach the right policies for SageMaker Notebook instance
        const nPolicy = new iam.Policy(this, "yolov8-notebookAccessPolicy", {
            policyName: "yolov8-notebookAccessPolicy",
            statements: [
                new iam.PolicyStatement({
                    actions: ['sagemaker:*'],
                    resources: ['*'],
                }),
                new iam.PolicyStatement({
                    actions: ['s3:ListAllMyBuckets'],
                    resources: ['arn:aws:s3:::*'],
                }),
                new iam.PolicyStatement({
                    actions: ['iam:PassRole', 'ecr:*', "logs:*"],
                    resources: ['*'],
                }),
                new iam.PolicyStatement({
                    actions: ['s3:*'],
                    resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
                }),
            ],
        });

        nPolicy.attachToRole(nRole);

        // Create SageMaker Notebook instance
        const notebookInstanceId = 'yolov8-sm-notebook';
        new sagemaker.CfnNotebookInstance(this, notebookInstanceId, {
            instanceType: 'ml.m5.4xlarge',
            volumeSizeInGb: 5,
            notebookInstanceName: notebookInstanceId,
            roleArn: nRole.roleArn,
            additionalCodeRepositories: [
                "https://github.com/aws-samples/host-yolov8-on-sagemaker-endpoint"
            ],
        });
    }
}
