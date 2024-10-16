// lib/api-stack.ts
import * as cdk from "aws-cdk-lib";
import { ApiConstruct } from "./constructs/api-construct";

export class ApiStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    new ApiConstruct(this, "ApiConstruct", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("apisubdomain"),
    });
  }
}
