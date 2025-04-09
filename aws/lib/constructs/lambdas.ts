import { Duration, Fn } from "aws-cdk-lib";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  Effect,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import {
  LayerVersion,
  Code,
  Runtime,
  Function,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { VpcConstruct } from "./vpc";
import { DatabaseConstruct } from "./database";
import { CognitoConstruct } from "./cognito";
import { Stack } from 'aws-cdk-lib';


export class LambdasConstruct extends Construct {
  public readonly userLambdas: Record<string, Function>;
  public readonly hasSeenLambdas: Record<string, Function>;
  public readonly feedLambdas: Record<string, Function>;
  public readonly postLambdas: Record<string, Function>;
  public readonly itemLambdas: Record<string, Function>;
  public readonly followLambdas: Record<string, Function>;
  public readonly likeLambdas: Record<string, Function>;
  public readonly commentLambdas: Record<string, Function>;

  constructor(
    scope: Construct,
    id: string,
    vpcConstruct: VpcConstruct,
    databaseConstuct: DatabaseConstruct,
    cognitoConstruct: CognitoConstruct
  ) {
    super(scope, id);

    
    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    // IAM Role for Lambda functions with IAM-based RDS Proxy authentication
    const lambdaRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

    // // Grant Lambda the ability to connect to the RDS Proxy using IAM authentication
    // databaseConstuct.dbProxy.grantConnect(lambdaRole);

    // // Ensure Lambda can authenticate with RDS Proxy using IAM
    // lambdaRole.addToPolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: ["rds-db:connect"],
    //     resources: [
    //       `arn:aws:rds:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:db-proxy/${databaseConstuct.dbProxy.dbProxyName}`,
    //     ],
    //   })
    // );

    // Lambda Layer
    const sharedLayer = new LayerVersion(this, "shared-layer", {
      code: Code.fromAsset("./lib/layer"),
      compatibleRuntimes: [Runtime.PYTHON_3_12],
      layerVersionName: "shared-layer",
    });

    // Helper function to create Lambda functions
    const createLambda = (
      id: string,
      handlerPath: string,
      functionName: string,
      inVpc? : boolean,
    ) => {
      const shouldUseVpc = inVpc ?? true;
      const l = new Function(this, id, {
        runtime: Runtime.PYTHON_3_12,
        handler: "handler." + functionName,
        code: Code.fromAsset(handlerPath),
        role: lambdaRole,
        timeout: Duration.seconds(60),
        vpc: shouldUseVpc ? vpcConstruct.vpc : undefined,
        vpcSubnets: shouldUseVpc ? vpcConstruct.vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        }) : undefined,
        securityGroups: shouldUseVpc ? [vpcConstruct.lambdaSecurityGroup] : undefined,
        environment: {
          DB_ENDPOINT: databaseConstuct.dbInstance.dbInstanceEndpointAddress, // Use RDS Proxy instead of direct DB
          DB_SECRET_ARN:
            databaseConstuct.dbInstance.secret?.secretFullArn || "",
          DB_PORT: "3306",
          DB_NAME: databaseConstuct.databaseName,
          REGION: process.env.CDK_DEFAULT_REGION || "us-east-1",
          SSL_CERT_FILE: "/opt/python/etc/ssl/certs/global-bundle.pem",
          USER_POOL_CLIENT_ID: cognitoConstruct.userPoolClient.userPoolClientId,
          USER_POOL_ID: cognitoConstruct.userPool.userPoolId
        },
        layers: [sharedLayer],
      });

      databaseConstuct.dbInstance.secret?.grantRead(l);
      return l;
    };

    this.userLambdas = {
      createUserLambda: createLambda(
        "CreateUserLambda",
        "lib/lambdas/api-endpoints/user/create-user",
        "handler",
        false
      ),
      deleteUserLambda: createLambda(
        "DeleteUserLambda",
        "lib/lambdas/api-endpoints/user/delete-user",
        "handler"
      ),
      getUserByIdLambda: createLambda(
        "GetUserByIdLambda",
        "lib/lambdas/api-endpoints/user/get-user-by-id",
        "handler"
      ),
      getUserByUsernameLambda: createLambda(
        "GetUserByUsernameLambda",
        "lib/lambdas/api-endpoints/user/get-user-by-username",
        "handler"
      ),
      getUsersLambda: createLambda(
        "GetUsersLambda",
        "lib/lambdas/api-endpoints/user/get-users",
        "handler"
      ),
      searchUsersLambda: createLambda(
        "SearchUsersLambda",
        "lib/lambdas/api-endpoints/user/search-users",
        "handler"
      ),
      updateUserLambda: createLambda(
        "UpdateUserLambda",
        "lib/lambdas/api-endpoints/user/update-user",
        "handler"
      ),
      userSignInLambda: createLambda(
        "UserSignInLambda",
        "lib/lambdas/api-endpoints/user/user-sign-in",
        "handler",
        false
      ),
      userSignInConfirmLambda: createLambda(
        "UserSignInConfirmLambda",
        "lib/lambdas/api-endpoints/user/user-confirm",
        "handler",
        false
      ),
      CreateUserInternal: createLambda(
        "CreateUserInternalLambda",
        "lib/lambdas/api-endpoints/user/user-create-internal",
        "handler",
      ),
    };

    this.userLambdas.userSignInConfirmLambda.addToRolePolicy(new PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [`arn:aws:lambda:${region}:${account}:function:DripDropAPI-lambdasConstructCreateUserInternalLamb-*`],
    }));

    this.userLambdas.userSignInConfirmLambda.addToRolePolicy(new PolicyStatement({
      actions: ['cognito-idp:AdminGetUser', 'cognito-idp:AdminDeleteUser'],
      resources: [
        `arn:aws:cognito-idp:${region}:${account}:userpool/${cognitoConstruct.userPool.userPoolId}`
      ],
    }));

    this.userLambdas.userSignInConfirmLambda.addEnvironment("INTERNAL_USER_LAMBDA_NAME", this.userLambdas.CreateUserInternal.functionName)

    this.userLambdas["updateUserLambda"].addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [`${Fn.importValue("OriginalImagesS3Bucket")}/*`],
        actions: ["s3:*"],
      })
    );

    this.hasSeenLambdas = {
      markAsSeenLambda: createLambda(
        "MarkAsSeenLambda",
        "lib/lambdas/api-endpoints/has-seen/mark-as-seen",
        "handler"
      ),
      getUsersByPostIdLambda: createLambda(
        "GetUsersByPostId",
        "lib/lambdas/api-endpoints/has-seen/get-users-by-post-id",
        "handler"
      ),
      getSeenPostsByUserIdLambda: createLambda(
        "GetSeenPostsByUserId",
        "lib/lambdas/api-endpoints/has-seen/get-seen-posts-by-user-id",
        "handler"
      ),
      resetSeenPostsForUserIdLambda: createLambda(
        "ResetSeenPostsForUserIdLambda",
        "lib/lambdas/api-endpoints/has-seen/reset-seen-posts-for-user-id",
        "handler"
      ),
    };

    this.feedLambdas = {
      getFeedLambda: createLambda(
        "GetFeedLambda",
        "lib/lambdas/api-endpoints/feed/get-feed",
        "handler"
      ),
    };

    this.postLambdas = {
      createPostLambda: createLambda(
        "CreatePostLambda",
        "lib/lambdas/api-endpoints/post/create-post",
        "handler"
      ),
      deletePostLambda: createLambda(
        "DeletePostLambda",
        "lib/lambdas/api-endpoints/post/delete-post",
        "handler"
      ),
      getAiRecommendationsLambda: createLambda(
        "GetAiRecommendationsLambda",
        "lib/lambdas/api-endpoints/post/get-ai-recommendations",
        "handler"
      ),
      getPostByIdLambda: createLambda(
        "GetPostByIdLambda",
        "lib/lambdas/api-endpoints/post/get-post-by-id",
        "handler"
      ),
      getPostsLambda: createLambda(
        "GetPostsLambda",
        "lib/lambdas/api-endpoints/post/get-posts",
        "handler"
      ),
      getPostsByUserIdLambda: createLambda(
        "GetPostsByUserIdLambda",
        "lib/lambdas/api-endpoints/post/get-posts-by-user-id",
        "handler"
      ),
      publishPostLambda: createLambda(
        "PublishPostLambda",
        "lib/lambdas/api-endpoints/post/publish-post",
        "handler"
      ),
      searchPostsLambda: createLambda(
        "searchPostsLambda",
        "lib/lambdas/api-endpoints/post/search-posts",
        "handler"
      ),
    };

    this.postLambdas["createPostLambda"].addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [Fn.importValue("OriginalImagesS3Bucket")],
        actions: ["s3:PutObject"],
      })
    );

    this.itemLambdas = {
      createItemLambda: createLambda(
        "createItemLambda",
        "lib/lambdas/api-endpoints/item/create-item",
        "handler"
      ),
      addDetailsLambda: createLambda(
        "addDetailsLambda",
        "lib/lambdas/api-endpoints/item/add-details",
        "handler"
      ),
      deleteItemLambda: createLambda(
        "deleteItemLambda",
        "lib/lambdas/api-endpoints/item/delete-item",
        "handler"
      ),
      getItemDetailsLambda: createLambda(
        "getItemDetailsLambda",
        "lib/lambdas/api-endpoints/item/get-item-details",
        "handler"
      ),
      getItemsLambda: createLambda(
        "getItemsLambda",
        "lib/lambdas/api-endpoints/item/get-items",
        "handler"
      ),
      updateItemDetailsLambda: createLambda(
        "updateItemDetailsLambda",
        "lib/lambdas/api-endpoints/item/update-details",
        "handler"
      ),
    };

    this.followLambdas = {
      followUserLambda: createLambda(
        "FollowUserLambda",
        "lib/lambdas/api-endpoints/follow/follow-user",
        "handler"
      ),
      getFollowingLambda: createLambda(
        "GetFollowing",
        "lib/lambdas/api-endpoints/follow/get-following",
        "handler"
      ),
      getFollowersLambda: createLambda(
        "GetFollowersLambda",
        "lib/lambdas/api-endpoints/follow/get-followers",
        "handler"
      ),
      unfollowUserLambda: createLambda(
        "UnfollowUserLambda",
        "lib/lambdas/api-endpoints/follow/unfollow-user",
        "handler"
      ),
    };

    this.likeLambdas = {
      likePostLambda: createLambda(
        "LikePostLambda",
        "lib/lambdas/api-endpoints/like/like-post",
        "handler"
      ),
      unlikePostLambda: createLambda(
        "UnlikePostLambda",
        "lib/lambdas/api-endpoints/like/unlike-post",
        "handler"
      ),
    };

    this.commentLambdas = {
      addCommentLambda: createLambda(
        "AddCommentLambda",
        "lib/lambdas/api-endpoints/comment/add-comment",
        "handler"
      ),
      deleteCommentLambda: createLambda(
        "DeleteCommentLambda",
        "lib/lambdas/api-endpoints/comment/delete-comment",
        "handler"
      ),
      getCommentsLambda: createLambda(
        "GetCommentsLambda",
        "lib/lambdas/api-endpoints/comment/get-comments",
        "handler"
      ),
    };
  }
}
