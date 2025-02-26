// lib/api-stack.ts
import * as cdk from "aws-cdk-lib";
import { ApiConstruct } from "./constructs/api-construct";
import { DnsConstruct } from "./constructs/dns";
import { VpcConstruct } from "./constructs/vpc";
import { DatabaseConstruct } from "./constructs/database";
import { LambdasConstruct } from "./constructs/lambdas";
import { ApigatewayConstruct } from "./constructs/apigateway";

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
