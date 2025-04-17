import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DnsConstruct } from "./dns";
import { LambdasConstruct } from "./lambdas";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { StaticSiteProps } from "../interfaces/staticProps.interface";
import { CognitoConstruct } from "./cognito";
import { Lambda } from "aws-cdk-lib/aws-ses-actions";

export class ApigatewayConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: StaticSiteProps,
    dnsConstruct: DnsConstruct,
    lambdaConstruct: LambdasConstruct,
    CognitoConstruct: CognitoConstruct
  ) {
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
        authorizer: CognitoConstruct.authorizer,
        operationName: "CreatePost",
      }
    );
    // GET /posts - Get All Posts
    posts.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.postLambdas["getPostsLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetPosts",
      }
    );

    // Define the /posts/{id} resource
    const post = posts.addResource("{id}");

    // DELETE /posts/{id} - Delete Post
    post.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.postLambdas["deletePostLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "DeletePost",
      }
    );
    // GET /posts/{id} - Get Post by ID
    post.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.postLambdas["getPostByIdLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetPostById",
      }
    );

    // Define the /posts/user/{uuid} resource
    const userPost = posts.addResource("user");
    const userID = userPost.addResource("{uuid}");

    // GET /posts/user/{uuid}} - Get Post by User ID
    userID.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.postLambdas["getPostsByUserIdLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetPostByUserId",
        requestParameters: {
          "method.request.querystring.status": false, // Optional parameter
        },
      }
    );

    // Define the /posts/search resource
    const searchPosts = posts.addResource("search");
    const searchPostsString = searchPosts.addResource("{searchString}");
    // GET /posts/search - Search posts
    searchPostsString.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.postLambdas["searchPostsLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "SearchPosts",
      }
    );

    // Define the /posts/publish/{id} resource
    const publishPost = posts.addResource("publish");
    const publishPostID = publishPost.addResource("{id}");
    // PUT /posts/publish/{id} - Publish Post
    publishPostID.addMethod(
      "PUT",
      new LambdaIntegration(lambdaConstruct.postLambdas["publishPostLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "PublishPost",
      }
    );

    // Define the /posts/ai-recommendations/{id} resource
    const aiRecommendations = posts.addResource("ai-recommendations");
    const aiRecommendationsID = aiRecommendations.addResource("{id}");
    // POST /posts/ai-recommendations/{id} - Publish Post
    aiRecommendationsID.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.postLambdas["getAiRecommendationsLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetAiRecommendations",
      }
    );

    // ---------------------------- Confirm Endpoint -----------------------------

    // define the /confirm resource
    const confirm = api.root.addResource("confirm");
    confirm.addMethod(
      "POST",
      new LambdaIntegration(
        lambdaConstruct.userLambdas["userSignInConfirmLambda"]
      ),
      {
        operationName: "ConfirmUser",
      }
    );

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
    users.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.userLambdas["getUsersLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetUsers",
      }
    );

    // Define the /users/{uuid} resource
    const user = users.addResource("{uuid}");

    // GET /users/{uuid} - Get User by ID
    user.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.userLambdas["getUserByIdLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetUserById",
      }
    );

    // PUT /users/{uuid} - Update User
    user.addMethod(
      "PUT",
      new LambdaIntegration(lambdaConstruct.userLambdas["updateUserLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "UpdateUser",
      }
    );

    // DELETE /users/{uuid} - Delete User
    user.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.userLambdas["deleteUserLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "DeleteUser",
      }
    );

    // Define the /username/{username} resource
    const username = users.addResource("username");
    const get_username = username.addResource("{username}");

    // GET /username/{username} - Get User by Username
    get_username.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.userLambdas["getUserByUsernameLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
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
    const searchUsersString = searchUsers.addResource("{searchString}");
    // GET /users/search - Search posts
    searchUsersString.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.userLambdas["searchUsersLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "SearchUsers",
      }
    );

    // Define the /users/refresh resource
    const refresh = users.addResource("refresh");

    // POST /users/refresh - Get new id/access token from refresh token
    refresh.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.userLambdas["userRefreshToken"]),
      {
        operationName: "RefreshUserToken",
      }
    );

    // -------------------------------- HAS SEEN ENDPOINTS -------------------------

    // Define the /hasSeen resource
    const hasSeen = api.root.addResource("hasSeen");

    // POST /hasSeen - Add new seen posts for a user
    hasSeen.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.hasSeenLambdas["markAsSeenLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "MarkAsSeen",
      }
    );

    // Define the /has-seen/{id} resource
    const hasSeenUserID = hasSeen.addResource("{uuid}");

    // Define the /has-seen/{id}/seenPosts resource
    const hasSeenPosts = hasSeenUserID.addResource("seenPosts");

    // GET /hasSeen/seenPosts - Get the list of seen posts by a userID
    hasSeenPosts.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.hasSeenLambdas["getSeenPostsByUserIdLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetSeenPosts",
      }
    );

    // Define the /has-seen/{id}/resetSeen resource
    const resetSeenPosts = hasSeenUserID.addResource("resetSeen");

    // DELETE /hasSeen/resetSeen - Resets the list of seen posts for a given userID
    resetSeenPosts.addMethod(
      "DELETE",
      new LambdaIntegration(
        lambdaConstruct.hasSeenLambdas["resetSeenPostsForUserIdLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "ResetSeenPosts",
      }
    );

    // Define the /has-seen/seenUsers resource
    const hasSeenUsers = hasSeen.addResource("seenUsers").addResource("{id}");

    // GET /hasSeen/seenUsers - Get the list of users that have seen a post
    hasSeenUsers.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.hasSeenLambdas["getUsersByPostIdLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetSeenUsers",
      }
    );

    // -------------------------------- FEED ENDPOINTS -------------------------

    // Define the /feed/{id} resource
    const feed = api.root.addResource("feed").addResource("{uuid}");

    // GET /feed - Gets the feed for a user ID
    feed.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.feedLambdas["getFeedLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetFeed",
        requestParameters: {
          "method.request.path.uuid": true,
          "method.request.querystring.limit": false,
        },
      }
    );

    // ----------------------------- FOLLOW ENDPOINTS -----------------------------

    // Define the /follow resource
    const follow = api.root.addResource("follow");

    // POST /follow - Follow a user, create follow relationship
    follow.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.followLambdas["followUserLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "FollowUser",
      }
    );

    // DELETE /follow - Unfollow user, delete follow relationship
    follow.addMethod(
      "DELETE",
      new LambdaIntegration(
        lambdaConstruct.followLambdas["unfollowUserLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
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
      new LambdaIntegration(
        lambdaConstruct.followLambdas["getFollowersLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetFollowers",
      }
    );

    // GET /follows/{id}/followers - Get Followers by ID
    following.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.followLambdas["getFollowingLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetFollowing",
      }
    );

    // ----------------------------- LIKE ENDPOINTS -----------------------------

    // Define the /follow resource
    const like = api.root.addResource("like");

    // POST /like - like a post
    like.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.likeLambdas["likePostLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "LikePost",
      }
    );

    // DELETE /like - unlike a post
    like.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.likeLambdas["unlikePostLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
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
        authorizer: CognitoConstruct.authorizer,
        operationName: "AddComment",
      }
    );

    // Define the /comment/{comment-id} resource
    const commentID = comment.addResource("{comment-id}");

    // DELETE /comment - remove a comment
    commentID.addMethod(
      "DELETE",
      new LambdaIntegration(
        lambdaConstruct.commentLambdas["deleteCommentLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "DeleteComent",
      }
    );

    // Define the /comment/post/{id} resource
    const commentPost = comment.addResource("post");
    const commentPostID = commentPost.addResource("{post-id}");

    // GET /comment/{post-id} - get comments for a post
    commentPostID.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.commentLambdas["getCommentsLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetCommentsByPostId",
      }
    );

    // ----------------------------- BOOKMARK ENDPOINTS -----------------------------

    // Define the /follow resource
    const bookmark = api.root.addResource("bookmark");

    // POST /bookmark - bookmark a post
    bookmark.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.bookmarkLambdas["createBookmarkLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "CreateBookmark",
      }
    );

    // DELETE /bookmark - remove a bookmark
    bookmark.addMethod(
      "DELETE",
      new LambdaIntegration(
        lambdaConstruct.bookmarkLambdas["deleteBookmarkLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "DeleteBookmark",
      }
    );

    // GET /bookmark - get comments for a post
    bookmark.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.commentLambdas["getBookmarksLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetBookmarks",
      }
    );

    //--------------------------- ITEM ENDPOINTS -----------------------------

    // Define the /items resource
    const items = api.root.addResource("items");

    // POST /items - create item
    items.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.itemLambdas["createItemLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "CreateItem",
      }
    );

    // Get items/details - get item details
    const itemDetails = items.addResource("details");
    // GET /items/{item-id} - get item details
    itemDetails.addMethod(
      "GET",
      new LambdaIntegration(
        lambdaConstruct.itemLambdas["getItemDetailsLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetItemDetails",
      }
    );

    // Define the /items/{item-id} resource
    const itemID = items.addResource("{item-id}");

    // DELETE /items/{item-id} - delete item
    itemID.addMethod(
      "DELETE",
      new LambdaIntegration(lambdaConstruct.itemLambdas["deleteItemLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "DeleteItem",
      }
    );

    // POST /items/{item-id} - add details
    itemID.addMethod(
      "POST",
      new LambdaIntegration(lambdaConstruct.itemLambdas["addDetailsLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "AddDetails",
      }
    );

    // PUT /items/{item-id} - update item details
    itemID.addMethod(
      "PUT",
      new LambdaIntegration(
        lambdaConstruct.itemLambdas["updateItemDetailsLambda"]
      ),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "UpdateItemDetails",
      }
    );

    // Define the /items/post/{post-id} resource
    const itemPost = items.addResource("post");
    const itemPostID = itemPost.addResource("{post-id}");
    itemPostID.addMethod(
      "GET",
      new LambdaIntegration(lambdaConstruct.itemLambdas["getItemsLambda"]),
      {
        authorizer: CognitoConstruct.authorizer,
        operationName: "GetItemsByPostId",
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
