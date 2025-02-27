import { Construct } from "constructs";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { StaticSiteProps } from "../interfaces/staticProps.interface";

export class DnsConstruct extends Construct {
    public readonly zone: IHostedZone;
    public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id);
    // Route 53 DNS setup
    this.zone = HostedZone.fromLookup(this, "dripdropzone", {
      domainName: props.domainName,
    });

    // Create a certificate for API Gateway
    this.certificate = new Certificate(this, "ApiCertificate", {
      domainName: `${props.siteSubDomain}.${props.domainName}`,
      validation: CertificateValidation.fromDns(this.zone),
    });
  }
}
