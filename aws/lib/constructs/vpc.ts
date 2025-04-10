import {
  Vpc,
  SubnetType,
  SecurityGroup,
  Peer,
  Port,
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpoint,
  InterfaceVpcEndpointAwsService,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
} from "aws-cdk-lib/aws-ec2";
import {
  Role,
  CompositePrincipal,
  ServicePrincipal,
  ArnPrincipal,
  ManagedPolicy,
  Policy,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { kMaxLength } from "buffer";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  public readonly vpc: Vpc;
  public readonly lambdaSecurityGroup: SecurityGroup;
  public readonly dbSecurityGroup: SecurityGroup;
  public readonly bastionHost: Instance;
  public readonly rdsIAMRole: Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // VPC for Aurora
    this.vpc = new Vpc(this, "secureVPC", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
        {
          cidrMask: 24,
          name: "private",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    this.dbSecurityGroup = new SecurityGroup(this, "DBSecurityGroup", {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    // Security Group for Lambda to access Aurora
    this.lambdaSecurityGroup = new SecurityGroup(this, "LambdaSG", {
      vpc: this.vpc,
      description: "Allow Lambda functions to access Aurora",
      allowAllOutbound: true,
    });

    // Create a bastion host in the public subnet
    const bastionSecurityGroup = new SecurityGroup(
      this,
      "BastionSecurityGroup",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
      }
    );

    this.dbSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      Port.tcp(3306),
      "Lambda to database"
    );

    // Allow the bastion to access the Aurora RDS
    this.dbSecurityGroup.addIngressRule(
      bastionSecurityGroup,
      Port.tcp(3306),
      "Allow bastion to access RDS on port 3306"
    );

    // Add a Gateway VPC Endpoint for S3
    this.vpc.addGatewayEndpoint("S3GatewayEndpoint", {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: [
        {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    new InterfaceVpcEndpoint(this, "Secrets ManagerEndpoint", {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: [this.lambdaSecurityGroup],
      subnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new InterfaceVpcEndpoint(this, "System ManagerEndpoint", {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SSM,
      securityGroups: [this.lambdaSecurityGroup],
      subnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new InterfaceVpcEndpoint(this, "System Messages Endpoint", {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      securityGroups: [this.lambdaSecurityGroup],
      subnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new InterfaceVpcEndpoint(this, "EC2 Messages Endpoint", {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      securityGroups: [this.lambdaSecurityGroup],
      subnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    new InterfaceVpcEndpoint(this, "SQS", {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SQS,
      securityGroups: [this.lambdaSecurityGroup],
      subnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        availabilityZones: ["us-east-1a", "us-east-1b"],
      }),
    });

    // IAM Role for RDS IAM Authentication
    this.rdsIAMRole = new Role(this, "RDSIAMAuthRole", {
      assumedBy: new ServicePrincipal("rds.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSFullAccess"),
      ],
    });

    // IAM Role for Bastion Host (Including SSM + RDS IAM Auth)
    const bastionRole = new Role(this, "BastionHostIAMRole", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
    });

    bastionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // Inline policy to allow RDS IAM authentication
    bastionRole.attachInlinePolicy(
      new Policy(this, "BastionRDSIAMPolicy", {
        statements: [
          new PolicyStatement({
            actions: ["rds-db:connect"],
            resources: ["*"], // Adjust for specific DB resources
          }),
        ],
      })
    );

    this.bastionHost = new Instance(this, "BastionHost", {
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2(),
      vpc: this.vpc,
      vpcSubnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroup: bastionSecurityGroup,
      role: bastionRole,
    });
  }
}
