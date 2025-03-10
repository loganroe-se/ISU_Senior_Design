import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DnsConstruct } from "./dns";
import { LambdasConstruct } from "./lambdas";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { StaticSiteProps } from "../interfaces/staticProps.interface";

export class ApigatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, props: StaticSiteProps, dnsConstruct: DnsConstruct, lambdaConstruct: LambdasConstruct) {
    super(scope, id);
    // API Gateway setup with custom domain
    const api = new RestApi(this, "UserApi", {
      restApiName: "User Service",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      domainName: {
        domainName: `${props.siteSubDomain}.${props.domainName}`,
        certificate: dnsConstruct.certificate,
      },
      deployOptions: {
        stageName: "prod",
      },
    });

    // -------------------------------- POST ENDPOINTS -------------------------

    // Define the /posts resource
    const posts = api.root.addResource("posts");

    // POST /posts - Create
    posts.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.postLambdas["createPostLambda"]),
      {
        operationName: "CreatePost",
      }
    );
    // GET /posts - Get All Posts
    posts.addMethod("GET", new LambdaIntegration(lambdaConstruct.postLambdas["getPostsLambda"]), {
      operationName: "GetPosts",
    });

    // Define the /posts/{id} resource
    const post = posts.addResource("{id}");

    // DELETE /posts/{id} - Delete Post
    post.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.postLambdas["deletePostLambda"]),
      {
        operationName: "DeletePost",
      }
    );
    // GET /posts/{id} - Get Post by ID
    post.addMethod("GET", new LambdaIntegration(lambdaConstruct.postLambdas["getPostByIdLambda"]), {
      operationName: "GetPostById",
    });

    // Define the /posts/user/{userID} resource
    const userPost = posts.addResource("user");
    const userID = userPost.addResource("{userID}");

    // GET /posts/user/{userID}} - Get Post by ID
    userID.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.postLambdas["getPostsByUserIdLambda"]),
      {
        operationName: "GetPostByUserId",
      }
    );

    // Define the /posts/search resource
    const searchPosts = posts.addResource("search");
    // GET /posts/search - Search posts
    searchPosts.addMethod("GET", new LambdaIntegration(lambdaConstruct.postLambdas["searchPostsLambda"]), {
      operationName: "SearchPosts",
    });

    // ---------------------------- USER ENDPOINTS -------------------------------

    // Define the /users resource
    const users = api.root.addResource("users");

    // POST /users - Create User
    users.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.userLambdas["createUserLambda"]),
      {
        operationName: "CreateUser",
      }
    );

    // GET /users - Get All Users
    users.addMethod("GET", new LambdaIntegration(lambdaConstruct.userLambdas["getUsersLambda"]), {
      operationName: "GetUsers",
    });

    // Define the /users/{id} resource
    const user = users.addResource("{id}");

    // GET /users/{id} - Get User by ID
    user.addMethod("GET", new LambdaIntegration(lambdaConstruct.userLambdas["getUserByIdLambda"]), {
      operationName: "GetUserById",
    });
    
    const userSuper = users.addResource("super");
    const userSuperID = userSuper.addResource("{userID}");

    // GET /users/super/{userID} - Get User Super by ID
    userSuperID.addMethod("GET", new LambdaIntegration(lambdaConstruct.userLambdas["getUserSuperByIdLambda"]), {
      operationName: "GetUserSuperById",
    });

    // PUT /users/{id} - Update User
    user.addMethod("PUT", new LambdaIntegration(lambdaConstruct.userLambdas["updateUserLambda"]), {
      operationName: "UpdateUser",
    });

    // DELETE /users/{id} - Delete User
    user.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.userLambdas["deleteUserLambda"]),
      {
        operationName: "DeleteUser",
      }
    );

    // Define the /username/{username} resource
    const username = users.addResource("username");
    const get_username = username.addResource("{username}");

    // GET /username/{username} - Get User by Username
    get_username.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.userLambdas["getUserByUsernameLambda"]),
      {
        operationName: "GetUserByUsername",
      }
    );

    // Define the /users/signIn resource
    const signIn = users.addResource("signIn");

    // POST /users/signIn
    signIn.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.userLambdas["userSignInLambda"]),
      {
        operationName: "UserSignIn",
      }
    );

    // Define the /users/search resource
    const searchUsers = users.addResource("search");
    // GET /users/search - Search posts
    searchUsers.addMethod("GET", new LambdaIntegration(lambdaConstruct.userLambdas["searchUsersLambda"]), {
      operationName: "SearchUsers",
    });

    // -------------------------------- HAS SEEN ENDPOINTS -------------------------

    // Define the /hasSeen resource
    const hasSeen = api.root.addResource("hasSeen");

    // POST /hasSeen - Add new seen posts for a user
    hasSeen.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.hasSeenLambdas["markAsSeenLambda"]),
      {
        operationName: "MarkAsSeen",
      }
    );

    // Define the /has-seen/{id} resource
    const hasSeenUserID = hasSeen.addResource("{id}");

    // Define the /has-seen/{id}/seenPosts resource
    const hasSeenPosts = hasSeenUserID.addResource("seenPosts");

    // GET /hasSeen/seenPosts - Get the list of seen posts by a userID
    hasSeenPosts.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.hasSeenLambdas["getSeenPostsByUserIdLambda"]),
      {
        operationName: "GetSeenPosts",
      }
    );

    // Define the /has-seen/{id}/resetSeen resource
    const resetSeenPosts = hasSeenUserID.addResource("resetSeen");

    // DELETE /hasSeen/resetSeen - Resets the list of seen posts for a given userID
    resetSeenPosts.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.hasSeenLambdas["resetSeenPostsForUserIdLambda"]),
      {
        operationName: "ResetSeenPosts",
      }
    );

    // Define the /has-seen/seenUsers resource
    const hasSeenUsers = hasSeen.addResource("seenUsers").addResource("{id}");

    // GET /hasSeen/seenUsers - Get the list of users that have seen a post
    hasSeenUsers.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.hasSeenLambdas["getUsersByPostIdLambda"]),
      {
        operationName: "GetSeenUsers",
      }
    );

    // -------------------------------- FEED ENDPOINTS -------------------------

    // Define the /feed/{id} resource
    const feed = api.root.addResource("feed").addResource("{userID}");

    // GET /feed - Gets the feed for a user ID
    feed.addMethod("GET", new LambdaIntegration(lambdaConstruct.feedLambdas["getFeedLambda"]), {
      operationName: "GetFeed",
      requestParameters: {
        "method.request.path.userID": true,
        "method.request.querystring.limit": false,
      },
    });

    // ----------------------------- FOLLOW ENDPOINTS -----------------------------

    // Define the /follow resource
    const follow = api.root.addResource("follow");

    // POST /follow - Follow a user, create follow relationship
    follow.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.followLambdas["followUserLambda"]),
      {
        operationName: "FollowUser",
      }
    );

    // DELETE /follow - Unfollow user, delete follow relationship
    follow.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.followLambdas["unfollowUserLambda"]),
      {
        operationName: "UnfollowUser",
      }
    );

    // Define the /follow/{id} resource to pass a user id
    const followId = follow.addResource("{id}");
    // Define the /follow/{id}/followers resource to get all followers for a user
    const followers = followId.addResource("followers");
    // Define the /follow/{id}/following resource to get following list for a user
    const following = followId.addResource("following");

    // GET /follow/{id}/followers - Get Followers for given user id
    followers.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.followLambdas["getFollowersLambda"]),
      {
        operationName: "GetFollowers",
      }
    );

    // GET /follows/{id}/followers - Get Followers by ID
    following.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.followLambdas["getFollowingLambda"]),
      {
        operationName: "GetFollowing",
      }
    );

    // ----------------------------- LIKE ENDPOINTS -----------------------------

    // Define the /follow resource
    const like = api.root.addResource("like");

    // POST /like - like a post
    like.addMethod("POST", new LambdaIntegration(lambdaConstruct.likeLambdas["likePostLambda"]), {
      operationName: "LikePost",
    });

    // DELETE /like - unlike a post
    like.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.likeLambdas["unlikePostLambda"]),
      {
        operationName: "UnlikePost",
      }
    );

    // ----------------------------- COMMENT ENDPOINTS -----------------------------

    // Define the /follow resource
    const comment = api.root.addResource("comment");

    // POST /comment - comment on a post
    comment.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.commentLambdas["addCommentLambda"]),
      {
        operationName: "AddComment",
      }
    );

    // Define the /comment/{comment-id} resource
    const commentID = comment.addResource("{comment-id}");

    // DELETE /comment - remove a comment
    commentID.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.commentLambdas["deleteCommentLambda"]),
      {
        operationName: "DeleteComent",
      }
    );

    // Define the /comment/post/{id} resource
    const commentPost = comment.addResource("post");
    const commentPostID = commentPost.addResource("{post-id}");

    // GET /comment/{post-id} - get comments for a post
    commentPostID.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.commentLambdas["getCommentsLambda"]),
      {
        operationName: "GetCommentsByPostId",
      }
    );

    // Create an ARecord for API Gateway in Route 53
    new ARecord(this, "ApiAliasRecord", {
      zone: dnsConstruct.zone,
      target: RecordTarget.fromAlias(new ApiGateway(api)),
      recordName: `${props.siteSubDomain}.${props.domainName}`,
    });
  }
}
