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

    // Security Group for Lambda to access Aurora
    this.lambdaSecurityGroup = new SecurityGroup(this, "LambdaSG", {
      vpc: this.vpc,
      description: "Allow Lambda functions to access Aurora",
      allowAllOutbound: true,
    });

    this.dbSecurityGroup = new SecurityGroup(this, "DBSecurityGroup", {
      vpc: this.vpc,
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

    // Create the IAM Role
    const ssmRole = new Role(this, "AmazonSSMRoleForInstancesQuickSetup", {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("ec2.amazonaws.com"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/ekriegel"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/kadenwin"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/kolbykuc"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/lroe"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/grich02"),
        new ArnPrincipal("arn:aws:iam::626635444817:user/zdfoote")
      ),
      roleName: "AmazonSSMRoleForInstancesQuickSetup",
    });

    // Attach Managed Policies
    ssmRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
    ssmRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMPatchAssociation")
    );

    // Define an inline policy with ssm:StartSession permission
    const ssmStartSessionPolicy = new Policy(this, "SSMStartSessionPolicy", {
      statements: [
        new PolicyStatement({
          actions: ["ssm:*"],
          resources: ["*"], // Adjust resource as necessary
        }),
      ],
    });

    // Attach the inline policy to the role
    ssmRole.attachInlinePolicy(ssmStartSessionPolicy);

    this.bastionHost = new Instance(this, "BastionHost", {
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2(),
      vpc: this.vpc,
      vpcSubnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      securityGroup: bastionSecurityGroup,
      role: ssmRole,
    });
  }
}
