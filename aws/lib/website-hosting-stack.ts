import * as cdk from 'aws-cdk-lib';
import { StaticSite } from './constructs/static-site';

/**
 * This stack relies on getting the domain name from CDK context.
 * Use 'cdk synth -c domain=mystaticsite.com -c subdomain=www'
 * Or add the following to cdk.json:
 * {
 *   "context": {
 *     "domain": "mystaticsite.com",
 *     "subdomain": "www",
 *     "accountId": "1234567890",
 *   }
 * }
**/
export class WebsiteHostingStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
      super(parent, name, props);

      new StaticSite(this, 'StaticSite', {
          domainName: this.node.tryGetContext('domain'),
          siteSubDomain: this.node.tryGetContext('subdomain'),
      });
  }
}
