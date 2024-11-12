#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteHostingStack } from '../lib/website-hosting-stack';
import { ApiStack } from '../lib/api-stack';


const app = new cdk.App();

const websiteStackName: string = app.node.tryGetContext("websiteStackName") || "WebsiteHostingStack";
const apiStackName:string = app.node.tryGetContext("apiStackName") || "MainAPI";

const websiteStack = new WebsiteHostingStack(app, websiteStackName, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: app.node.tryGetContext("accountId"), region: 'us-east-1' },
  stackName: websiteStackName,
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

const apiStack = new ApiStack(app, apiStackName, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: app.node.tryGetContext("accountId"), region: 'us-east-1' },
  stackName: apiStackName,

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
