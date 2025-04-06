// lib/api-stack.ts
import * as cdk from "aws-cdk-lib";
import { DnsConstruct } from "./constructs/dns";
import { VpcConstruct } from "./constructs/vpc";
import { DatabaseConstruct } from "./constructs/database";
import { LambdasConstruct } from "./constructs/lambdas";
import { ApigatewayConstruct } from "./constructs/apigateway";
import { IAMConstruct } from "./constructs/ssm";
import { CognitoConstruct } from "./constructs/cognito";

export class ApiStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    const dnsConstruct = new DnsConstruct(this, "dnsConstruct", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("apisubdomain"),
    });

    const vpcConstruct = new VpcConstruct(this, "vpcConstruct");

    const databaseConstuct = new DatabaseConstruct(
      this,
      "databaseConstruct",
      vpcConstruct
    );

    const lambdaConstruct = new LambdasConstruct(
      this,
      "lambdasConstruct",
      vpcConstruct,
      databaseConstuct
    );

    new CognitoConstruct(this, "CognitoConstruct");

    new IAMConstruct(this, "SSMiamConstruct"); 

    new ApigatewayConstruct(
      this,
      "apigatewayConstruct",
      {
        domainName: this.node.tryGetContext("domain"),
        siteSubDomain: this.node.tryGetContext("apisubdomain"),
      },
      dnsConstruct,
      lambdaConstruct
    );
  }
}
