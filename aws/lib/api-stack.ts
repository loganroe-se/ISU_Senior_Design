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

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Route 53 DNS setup
    const domainName = "domain.com"; // We need to setup on domain 
    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName });

    // Create a certificate for API Gateway
    const certificate = new certificatemanager.Certificate(
      this,
      "ApiCertificate",
      {
        domainName: `api.${domainName}`,
        validation: certificatemanager.CertificateValidation.fromDns(zone),
      }
    );

    // VPC for Aurora
    const vpc = new ec2.Vpc(this, "AuroraVpc", {
      maxAzs: 2,
    });

    // Aurora MySQL Cluster
    const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      instanceProps: {
        vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE3,
          ec2.InstanceSize.MEDIUM
        ),
      },
      defaultDatabaseName: "usersdb",
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
      ],
    });

    // Helper function to create Lambda functions
    const createLambda = (id: string, handlerPath: string) => {
      return new lambda.Function(this, id, {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
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
      "lambda/createUser"
    );
    const getUsersLambda = createLambda("GetUsersLambda", "lambda/getUsers");
    const getUserByIdLambda = createLambda(
      "GetUserByIdLambda",
      "lambda/getUserById"
    );
    const updateUserLambda = createLambda(
      "UpdateUserLambda",
      "lambda/updateUser"
    );
    const deleteUserLambda = createLambda(
      "DeleteUserLambda",
      "lambda/deleteUser"
    );

    // API Gateway setup with custom domain
    const api = new apigateway.RestApi(this, "UserApi", {
      restApiName: "User Service",
      domainName: {
        domainName: `api.${domainName}`,
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
      recordName: `api.${domainName}`,
    });

    // Output the API endpoint
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
  }
}
