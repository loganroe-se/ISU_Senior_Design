import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  Policy,
  PolicyStatement,
  ArnPrincipal,
  CompositePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class IAMConstruct extends Construct {
  public readonly ssmRole: Role;
  public readonly userAccessRole: Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // IAM Role for EC2 to connect to SSM
    this.ssmRole = new Role(this, "AmazonSSMRoleForEC2", {
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

    
    // Attach Amazon SSM Managed Policies
    this.ssmRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
    this.ssmRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMPatchAssociation")
    );

    // Inline policy for SSM Start Session (optional, for remote access)
    this.ssmRole.attachInlinePolicy(
      new Policy(this, "SSMStartSessionPolicy", {
        statements: [
          new PolicyStatement({
            actions: ["ssm:StartSession"],
            resources: ["*"], // Restrict as needed
          }),
          new PolicyStatement({
            actions: ["ecs:*"],
            resources: ["*"]
          })
        ],
      })
    );
  }
}
