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
    const zone = route53.HostedZone.fromLookup(this, "dripdropzone", {
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
    const vpc = new ec2.Vpc(this, "dripdropvpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
        {
          cidrMask: 24,
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Security Group for Lambda to access Aurora
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, "LambdaSG", {
      vpc,
      description: "Allow Lambda functions to access Aurora",
      allowAllOutbound: true,
    });

    lambdaSecurityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow lambda access to SM"
    );

    lambdaSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow lambda access to SM"
    );

    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc,
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(3306),
      "Lambda to database"
    );

    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Connection for mysql databench"
    );

    new ec2.InterfaceVpcEndpoint(this, "Secrets ManagerEndpoint", {
      vpc: vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: [lambdaSecurityGroup],
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new ec2.InterfaceVpcEndpoint(this, "System ManagerEndpoint", {
      vpc: vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      securityGroups: [lambdaSecurityGroup],
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new ec2.InterfaceVpcEndpoint(this, "System Messages Endpoint", {
      vpc: vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      securityGroups: [lambdaSecurityGroup],
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new ec2.InterfaceVpcEndpoint(this, "EC2 Messages Endpoint", {
      vpc: vpc,
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      securityGroups: [lambdaSecurityGroup],
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });




    const databaseName = "dripdropdb";
    // Aurora MySQL Cluster
    const cluster = new rds.DatabaseInstance(this, "AuroraCluster", {
      engine: rds.DatabaseInstanceEngine.MYSQL,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc: vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroups: [dbSecurityGroup],
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      backupRetention: cdk.Duration.days(0),
      deletionProtection: false,
      credentials: rds.Credentials.fromGeneratedSecret("clusteradmin"),
      databaseName: databaseName,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes
      publiclyAccessible: true,
    });

    const dbProxy = cluster.addProxy("DripDropProx", {
      secrets: [cluster.secret!],
      securityGroups: [dbSecurityGroup],
      vpc,
      requireTLS: false,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
    });

    // Step 4: Create a bastion host in the public subnet
    const bastionSecurityGroup = new ec2.SecurityGroup(
      this,
      "BastionSecurityGroup",
      {
        vpc,
        allowAllOutbound: true,
      }
    );

    // Allow the bastion to access the Aurora RDS
    dbSecurityGroup.addIngressRule(
      bastionSecurityGroup,
      ec2.Port.tcp(3306),
      "Allow bastion to access RDS on port 3306"
    );

    // Create the IAM Role
    const ssmRole = new iam.Role(this, "AmazonSSMRoleForInstancesQuickSetup", {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal("ec2.amazonaws.com"),
        new iam.ArnPrincipal("arn:aws:iam::626635444817:user/ekriegel"),
        new iam.ArnPrincipal("arn:aws:iam::626635444817:user/kadenwin"),
        new iam.ArnPrincipal("arn:aws:iam::626635444817:user/kolbykuc") // Replace <Account ID> and <Specific IAM User> with your details
      ),
      roleName: "AmazonSSMRoleForInstancesQuickSetup",
    });

    // Attach Managed Policies
    ssmRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
    ssmRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMPatchAssociation")
    );

    // Define an inline policy with ssm:StartSession permission
    const ssmStartSessionPolicy = new iam.Policy(
      this,
      "SSMStartSessionPolicy",
      {
        statements: [
          new iam.PolicyStatement({
            actions: ["ssm:*"],
            resources: ["*"], // Adjust resource as necessary
          }),
        ],
      }
    );

    // Attach the inline policy to the role
    ssmRole.attachInlinePolicy(ssmStartSessionPolicy);

    const bastionHost = new ec2.Instance(this, "BastionHost", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroup: bastionSecurityGroup,
      role: ssmRole,
    });

    // Step 5: Grant the bastion host access to the RDS cluster
    cluster.connections.allowDefaultPortFrom(bastionHost);

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

    // Lambda Layer
    const sharedLayer = new lambda.LayerVersion(this, "shared-layer", {
      code: lambda.Code.fromAsset("./lib/layer"),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      layerVersionName: "shared-layer",
    });

    // Helper function to create Lambda functions
    const createLambda = (
      id: string,
      handlerPath: string,
      functionName: string
    ) => {
      const l = new lambda.Function(this, id, {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "handler." + functionName,
        code: lambda.Code.fromAsset(handlerPath),
        role: lambdaRole,
        timeout: cdk.Duration.seconds(60),
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }),
        securityGroups: [lambdaSecurityGroup],
        environment: {
          DB_ENDPOINT_ADDRESS: dbProxy.endpoint,
          DB_SECRET_ARN: cluster.secret?.secretFullArn || "",
          DB_PORT: cluster.dbInstanceEndpointPort,
          DB_NAME: databaseName,
        },
        layers: [sharedLayer],
      });

      cluster.secret?.grantRead(l);
      return l;
    };

    // Create separate Lambda functions for each CRUD operation
    const createUserLambda = createLambda(
      "CreateUserLambda",
      "lib/lambdas/user/createUser",
      "createUser"
    );
    const getUsersLambda = createLambda(
      "GetUsersLambda",
      "lib/lambdas/user/getUsers",
      "getUsers"
    );
    const getUserByIdLambda = createLambda(
      "GetUserByIdLambda",
      "lib/lambdas/user/getUserById",
      "getUserById"
    );
    const updateUserLambda = createLambda(
      "UpdateUserLambda",
      "lib/lambdas/user/updateUser",
      "updateUser"
    );
    const deleteUserLambda = createLambda(
      "DeleteUserLambda",
      "lib/lambdas/user/deleteUser",
      "deleteUser"
    );
    const getUserByUsernameLambda = createLambda(
      "GetUserByUsernameLambda",
      "lib/lambdas/user/getUserByUsername",
      "getUserByUsername"
    );
    const userSignInLambda = createLambda(
      "UserSignInLambda",
      "lib/lambdas/user/userSignIn",
      "signIn"
    );
    const createImageLambda = createLambda(
      "CreateImageLambda",
      "lib/lambdas/image/createImage",
      "createImage"
    );
    const deleteImageLambda = createLambda(
      "DeleteImageLambda",
      "lib/lambdas/image/deleteImage",
      "deleteImage"
    );
    const getImageByImageIdLambda = createLambda(
      "GetImageByImageIdLambda",
      "lib/lambdas/image/getImageByImageId",
      "getImageByImageId"
    );
    const getImageByPostIdLambda = createLambda(
      "GetImageByPostIdLambda",
      "lib/lambdas/image/getImageByPostId",
      "getImageByPostId"
    );
    const getImagesLambda = createLambda(
      "GetImagesLambda",
      "lib/lambdas/image/getImages",
      "getImages"
    );
    const updateImageLambda = createLambda(
      "UpdateImageLambda",
      "lib/lambdas/image/updateImage",
      "updateImage"
    );
    const createTagLambda = createLambda(
      "CreateTagLambda",
      "lib/lambdas/tag/createTag",
      "createTag"
    );
    const deleteTagLambda = createLambda(
      "DeleteTagLambda",
      "lib/lambdas/tag/deleteTag",
      "deleteTag"
    );
    const getTagByIdLambda = createLambda(
      "GetTagByIdLambda",
      "lib/lambdas/tag/getTagById",
      "getTagById"
    );
    const getTagsLambda = createLambda(
      "GetTagsLambda",
      "lib/lambdas/tag/getTags",
      "getTags"
    );
    const updateTagLambda = createLambda(
      "UpdateTagLambda",
      "lib/lambdas/tag/updateTag",
      "updateTag"
    );
    const manageDBLambda = createLambda(
      "ManageDBLambda",
      "lib/lambdas/db",
      "manageDB"
    );
    const createPostLambda = createLambda(
      "CreatePostLambda",
      "lib/lambdas/post/createPost",
      "createPost"
    );
    const deletePostLambda = createLambda(
      "DeletePostLambda",
      "lib/lambdas/post/deletePost",
      "deletePost"
    );
    const getPostsLambda = createLambda(
      "GetPostsLambda",
      "lib/lambdas/post/getPosts",
      "getPosts"
    );
    const getPostByIdLambda = createLambda(
      "GetPostByIdLambda",
      "lib/lambdas/post/getPostById",
      "getPostById"
    );
    const updatePostLambda = createLambda(
      "UpdatePostLambda",
      "lib/lambdas/post/updatePost",
      "updatePost"
    );
    const followUserLambda = createLambda(
      "FollowUserLambda",
      "lib/lambdas/follow/followUser",
      "followUser"
    );
    const getFollowingByIdLambda = createLambda(
      "GetFollowingByIdLambda",
      "lib/lambdas/follow/getFollowingById",
      "getFollowingById"
    );
    const getFollowersByIdLambda = createLambda(
      "GetFollowersByIdLambda",
      "lib/lambdas/follow/getFollowersById",
      "getFollowersById"
    );

    // API Gateway setup with custom domain
    const api = new apigateway.RestApi(this, "UserApi", {
      restApiName: "User Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
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
    const follows = api.root.addResource("follows");
    const posts = api.root.addResource("posts");
    const images = api.root.addResource("images");
    const tags = api.root.addResource("tags");

    // --------------- IMAGE LAMBDAS ---------------
    // POST /images - Create
    images.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createImageLambda),
      {
        operationName: "CreateImage",
      }
    );

    // GET /images - Get All Images
    images.addMethod("GET", new apigateway.LambdaIntegration(getImagesLambda), {
      operationName: "GetImages",
    });

    // Define the /images/{id} resource
    const image = images.addResource("{id}");

    // DELETE /images/{id} - Delete Image
    image.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteImageLambda),
      {
        operationName: "DeleteImageLambda",
      }
    );

    // GET /images/{id} - Get Image by Image ID
    image.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getImageByImageIdLambda),
      {
        operationName: "GetImageByImageId",
      }
    );

    // PUT /images/{id} - Update Image
    image.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updateImageLambda),
      {
        operationName: "UpdateImage",
      }
    );

    // GET /images/{id} - Get Image(s) by Post ID
    images
      .addResource("post-id")
      .addResource("{id}")
      .addMethod(
        "GET",
        new apigateway.LambdaIntegration(getImageByPostIdLambda),
        {
          operationName: "GetImageByPostId",
        }
      );

    // --------------- TAG LAMBDAS ---------------
    // POST /tags - Create
    tags.addMethod("POST", new apigateway.LambdaIntegration(createTagLambda), {
      operationName: "CreateTag",
    });

    // GET /tags - Get ALL Tags
    tags.addMethod("GET", new apigateway.LambdaIntegration(getTagsLambda), {
      operationName: "GetTags",
    });

    // Define the /tags/{id} resource
    const tag = tags.addResource("{id}");

    // DELETE /tags/{id} - Delte Tag
    tag.addMethod("DELETE", new apigateway.LambdaIntegration(deleteTagLambda), {
      operationName: "DeleteTagLambda",
    });

    // GET /tags/{id} - Get Tag by ID
    tag.addMethod("GET", new apigateway.LambdaIntegration(getTagByIdLambda), {
      operationName: "GetTagById",
    });

    // PUT /tags/{id} - Update Tag
    tag.addMethod("PUT", new apigateway.LambdaIntegration(updateTagLambda), {
      operationName: "UpdateTag",
    });

    // --------------- POST LAMBDAS ---------------
    //POST /posts - Create
    posts.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createPostLambda),
      {
        operationName: "CreatePost",
      }
    );
    // GET /posts - Get All Posts
    posts.addMethod("GET", new apigateway.LambdaIntegration(getPostsLambda), {
      operationName: "GetPosts",
    });

    // Define the /posts/{id} resource
    const post = posts.addResource("{id}");

    // DELETE /posts/{id} - Delete Post
    post.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deletePostLambda),
      {
        operationName: "DeletePost",
      }
    );
    // GET /posts/{id} - Get Post by ID
    post.addMethod("GET", new apigateway.LambdaIntegration(getPostByIdLambda), {
      operationName: "GetPostById",
    });
    // PUT /posts/{id} - Update Post
    post.addMethod("PUT", new apigateway.LambdaIntegration(updatePostLambda), {
      operationName: "UpdatePost",
    });

    // --------------- FOLLOW LAMBDAS ---------------
    // POST /follows - Follow User
    follows.addMethod(
      "POST",
      new apigateway.LambdaIntegration(followUserLambda),
      {
        operationName: "FollowUser",
      }
    );

    // Define the /follows/{id} resource
    const followUser = follows.addResource("{id}");

    // GET /follows/{id} - Get Following by ID
    followUser.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getFollowingByIdLambda),
      {
        operationName: "GetFollowingById",
      }
    );

    const userFollowers = followUser.addResource("followers");

    // GET /follows/{id}/followers - Get Followers by ID
    userFollowers.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getFollowersByIdLambda),
      {
        operationName: "GetFollowersById",
      }
    );

    // --------------- USER LAMBDAS ---------------
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

    // Define the /username/{username} resource
    const username = users.addResource("username");
    const get_username = username.addResource("{username}")

    // GET /username/{username} - Get User by Username
    get_username.addMethod("GET", new apigateway.LambdaIntegration(getUserByUsernameLambda), {
      operationName: "GetUserByUsername",
    });

    // Define the /users/signIn resource
    const signIn = users.addResource("signIn");

    // POST /users/signIn
    signIn.addMethod(
      "POST",
      new apigateway.LambdaIntegration(userSignInLambda),
      {
        operationName: "UserSignIn",
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

    // // Optional: Output the bastion public IP and RDS endpoint
    // new cdk.CfnOutput(this, "BastionPublicIP", {
    //   value: bastionHost.instancePublicIp,
    // });

    new cdk.CfnOutput(this, "RDSEndpoint", {
      value: cluster.instanceEndpoint.hostname,
    });
  }
}
