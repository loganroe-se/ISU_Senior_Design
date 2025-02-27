import {
  InstanceType,
  InstanceClass,
  InstanceSize,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  Credentials,
  DatabaseProxy,
  ProxyTarget,
  CaCertificate,
} from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { VpcConstruct } from "./vpc";
import { Duration, RemovalPolicy, SecretValue } from "aws-cdk-lib";
import { Role, ServicePrincipal, ManagedPolicy, Effect, PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class DatabaseConstruct extends Construct {
  public readonly dbInstance: DatabaseInstance;
  public readonly databaseName: string;
  public readonly dbProxy: DatabaseProxy;

  constructor(scope: Construct, id: string, vpcConstruct: VpcConstruct) {
    super(scope, id);

    this.databaseName = "dripdropsqldb";
    
    // Aurora MySQL Cluster
    this.dbInstance = new DatabaseInstance(this, "AuroraCluster", {
      engine: DatabaseInstanceEngine.MYSQL,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      vpc: vpcConstruct.vpc,
      vpcSubnets: vpcConstruct.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroups: [vpcConstruct.dbSecurityGroup],
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      backupRetention: Duration.days(0),
      deletionProtection: false,
      databaseName: this.databaseName,
      removalPolicy: RemovalPolicy.DESTROY, // For development purposes
      publiclyAccessible: false,
      iamAuthentication: true,
      caCertificate: CaCertificate.RDS_CA_RSA2048_G1
    });


    // Create the IAM role for RDS Proxy
    const rdsProxyRole = new Role(this, 'RDSProxyRole', {
      assumedBy: new ServicePrincipal('rds.amazonaws.com'),
      inlinePolicies: {
        'RDSProxyPolicy': new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['secretsmanager:*'],
              resources: ["arn:aws:secretsmanager:us-east-1:*:secret:*/*"],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['kms:*'],
              resources: ["arn:aws:kms:us-east-1:*:*/*"],
            
            }),
          ],
        }),
      },
    });


    // RDS Proxy with IAM authentication
    this.dbProxy = new DatabaseProxy(this, "AuroraClusterProxy", {
      proxyTarget: ProxyTarget.fromInstance(this.dbInstance),
      secrets: [this.dbInstance.secret!], // No static secrets, IAM auth only
      securityGroups: [vpcConstruct.dbSecurityGroup],
      vpc: vpcConstruct.vpc,
      requireTLS: true,
      iamAuth: true, // Enable IAM authentication for proxy
      vpcSubnets: vpcConstruct.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      role: rdsProxyRole
    });

    this.dbInstance.connections.allowDefaultPortFrom(vpcConstruct.bastionHost);
  }
}
