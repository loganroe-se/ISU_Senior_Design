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
} from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { VpcConstruct } from "./vpc";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export class DatabaseConstruct extends Construct {
  public readonly dbInstance: DatabaseInstance;
  public readonly databaseName: string;
  public readonly dbProxy: DatabaseProxy;

  constructor(scope: Construct, id: string, vpcConstruct: VpcConstruct) {
    super(scope, id);

    this.databaseName = "dripdropdb";
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
      credentials: Credentials.fromGeneratedSecret("clusteradmin"),
      databaseName: this.databaseName,
      removalPolicy: RemovalPolicy.DESTROY, // For development purposes
      publiclyAccessible: false,
    });

    this.dbProxy = this.dbInstance.addProxy("AuroraClusterProxy", {
      secrets: [this.dbInstance.secret!],
      securityGroups: [vpcConstruct.dbSecurityGroup],
      vpc: vpcConstruct.vpc,
      requireTLS: false,
      vpcSubnets: vpcConstruct.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    });

    this.dbInstance.connections.allowDefaultPortFrom(vpcConstruct.bastionHost);
  }
}
