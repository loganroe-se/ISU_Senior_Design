import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from "constructs";

export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly authorizer: apigateway.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      generateSecret: false,
    });

    // Assuming userPool is passed in or imported
    this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "APIAuthorizer",
      {
        cognitoUserPools: [this.userPool],
        identitySource: "method.request.header.Authorization",
      }
    );
  }
}
