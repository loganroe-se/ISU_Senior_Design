// lib/api-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";

export interface StaticSiteProps {
  domainName: string;
  siteSubDomain: string;
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
export class ApiConstruct extends Construct {
  constructor(parent: Stack, name: string, props: StaticSiteProps) {
    super(parent, name);

    // Route 53 DNS setup
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });

    // Create a certificate for API Gateway
    const certificate = new certificatemanager.Certificate(
      this,
      "ApiCertificate",
      {
        domainName: `${props.siteSubDomain}.${props.domainName}`,
        validation: certificatemanager.CertificateValidation.fromDns(zone),
      }
    );

    // VPC for Aurora
    const vpc = new ec2.Vpc(this, "AuroraVpc", {
      maxAzs: 2
    });

    // Create username and password secret for DB Cluster
    const secret = new rds.DatabaseSecret(this, "AuroraSecret", {
      username: "clusteradmin",
    });

    // Aurora MySQL Cluster
    const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_2_11_4,
      }),
      writer: rds.ClusterInstance.provisioned('writer', {
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
        rds.ClusterInstance.serverlessV2('reader2'),
      ],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      vpc: vpc,
      credentials: { username: "clusteradmin", secret: secret },
      defaultDatabaseName: "dripdropdb",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes
    });

    // Security Group for Lambda to access Aurora
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, "LambdaSG", {
      vpc,
      description: "Allow Lambda functions to access Aurora",
      allowAllOutbound: true,
    });

    cluster.connections.allowDefaultPortFrom(
      lambdaSecurityGroup,
      "Allow Lambda access"
    );

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

    // Helper function to create Lambda functions
    const createLambda = (
      id: string,
      handlerPath: string,
      functionName: string
    ) => {
      return new lambda.Function(this, id, {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "handler." + functionName,
        code: lambda.Code.fromAsset(handlerPath),
        role: lambdaRole,
        vpc,
        securityGroups: [lambdaSecurityGroup],
        environment: {
          DB_HOST: cluster.clusterEndpoint.hostname,
          DB_NAME: "usersdb", // Need to be changed
          DB_USER: "admin", // Need to be changed
          DB_PASSWORD: "password", // Need to be changed
        },
      });
    };

    // Create separate Lambda functions for each CRUD operation
    const createUserLambda = createLambda(
      "CreateUserLambda",
      "lib/lambdas/user",
      "test"
    );
    const getUsersLambda = createLambda(
      "GetUsersLambda",
      "lib/lambdas/user",
      "test"
    );
    const getUserByIdLambda = createLambda(
      "GetUserByIdLambda",
      "lib/lambdas/user",
      "test"
    );
    const updateUserLambda = createLambda(
      "UpdateUserLambda",
      "lib/lambdas/user",
      "test"
    );
    const deleteUserLambda = createLambda(
      "DeleteUserLambda",
      "lib/lambdas/user",
      "test"
    );

    // API Gateway setup with custom domain
    const api = new apigateway.RestApi(this, "UserApi", {
      restApiName: "User Service",
      domainName: {
        domainName: `${props.siteSubDomain}.${props.domainName}`,
        certificate,
      },
      deployOptions: {
        stageName: "prod",
      },
    });

    // Define the /users resource
    const users = api.root.addResource("users");

    // POST /users - Create User
    users.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createUserLambda),
      {
        operationName: "CreateUser",
      }
    );

    // GET /users - Get All Users
    users.addMethod("GET", new apigateway.LambdaIntegration(getUsersLambda), {
      operationName: "GetUsers",
    });

    // Define the /users/{id} resource
    const user = users.addResource("{id}");

    // GET /users/{id} - Get User by ID
    user.addMethod("GET", new apigateway.LambdaIntegration(getUserByIdLambda), {
      operationName: "GetUserById",
    });

    // PUT /users/{id} - Update User
    user.addMethod("PUT", new apigateway.LambdaIntegration(updateUserLambda), {
      operationName: "UpdateUser",
    });

    // DELETE /users/{id} - Delete User
    user.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteUserLambda),
      {
        operationName: "DeleteUser",
      }
    );

    // Create an ARecord for API Gateway in Route 53
    new route53.ARecord(this, "ApiAliasRecord", {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
      recordName: `${props.siteSubDomain}.${props.domainName}`,
    });

    // Output the API endpoint
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
  }
}
