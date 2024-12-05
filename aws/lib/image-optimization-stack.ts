// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  Fn,
  Stack,
  StackProps,
  RemovalPolicy,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_lambda as lambda,
  aws_iam as iam,
  Duration,
  CfnOutput,
  aws_logs as logs,
} from "aws-cdk-lib";
import { CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import { getOriginShieldRegion } from "./origin-shield";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

// Stack Parameters

// CloudFront parameters
var CLOUDFRONT_ORIGIN_SHIELD_REGION = getOriginShieldRegion(
  process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || "us-east-1"
);
// Parameters of transformed images
var S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION = "90";
var S3_TRANSFORMED_IMAGE_CACHE_TTL = "max-age=31622400";
// Max image size in bytes. If generated images are stored on S3, bigger images are generated, stored on S3
// and request is redirect to the generated image. Otherwise, an application error is sent.
var MAX_IMAGE_SIZE = "4700000";
// Lambda Parameters
var LAMBDA_MEMORY = "1500";
var LAMBDA_TIMEOUT = "60";

type ImageDeliveryCacheBehaviorConfig = {
  origin: any;
  compress: any;
  viewerProtocolPolicy: any;
  cachePolicy: any;
  functionAssociations: any;
  responseHeadersPolicy?: any;
};

type LambdaEnv = {
  originalImageBucketName: string;
  transformedImageBucketName?: any;
  transformedImageCacheTTL: string;
  maxImageSize: string;
};

export class ImageOptimizationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = this.node.tryGetContext("domain");
    const subDomain = "cdn";

    var originalImageBucket;
    var transformedImageBucket;

    const zone = HostedZone.fromLookup(this, "Zone", {
      domainName: domainName,
    });

    const cdnDomain = subDomain + "." + domainName;

    // TLS certificate
    const certificate = new Certificate(this, "SiteCertificate", {
      domainName: cdnDomain,
      validation: CertificateValidation.fromDns(zone),
    });

    originalImageBucket = new s3.Bucket(
      this,
      "s3-dripdrop-original-image-bucket",
      {
        removalPolicy: RemovalPolicy.DESTROY,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        autoDeleteObjects: true,
      }
    );

    new CfnOutput(this, "OriginalImagesS3Bucket", {
      description: "S3 bucket where original images are stored",
      value: originalImageBucket.bucketName,
    });

    transformedImageBucket = new s3.Bucket(
      this,
      "s3-dripdrop-transformed-image-bucket",
      {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        lifecycleRules: [
          {
            expiration: Duration.days(
              parseInt(S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION)
            ),
          },
        ],
      }
    );

    // prepare env variable for Lambda
    var lambdaEnv: LambdaEnv = {
      originalImageBucketName: originalImageBucket.bucketName,
      transformedImageCacheTTL: S3_TRANSFORMED_IMAGE_CACHE_TTL,
      maxImageSize: MAX_IMAGE_SIZE,
    };

    lambdaEnv.transformedImageBucketName = transformedImageBucket.bucketName;

    // IAM policy to read from the S3 bucket containing the original images
    const s3ReadOriginalImagesPolicy = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      resources: ["arn:aws:s3:::" + originalImageBucket.bucketName + "/*"],
    });

    // statements of the IAM policy to attach to Lambda
    var iamPolicyStatements = [s3ReadOriginalImagesPolicy];

    // Lambda Layer
    const layer = new lambda.LayerVersion(this, "shared-layer", {
      code: lambda.Code.fromAsset("./lib/imageDnsLayer"),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      layerVersionName: "image-dns-layer",
    });
    // Create Lambda for image processing
    var lambdaProps = {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./lib/lambdas/image-processing"),
      timeout: Duration.seconds(parseInt(LAMBDA_TIMEOUT)),
      memorySize: parseInt(LAMBDA_MEMORY),
      environment: lambdaEnv,
      logRetention: logs.RetentionDays.ONE_DAY,
      layers: [layer]
    };

    var imageProcessing = new lambda.Function(
      this,
      "image-optimization",
      lambdaProps
    );

    // Enable Lambda URL
    const imageProcessingURL = imageProcessing.addFunctionUrl();

    // Leverage CDK Intrinsics to get the hostname of the Lambda URL
    const imageProcessingDomainName = Fn.parseDomainName(
      imageProcessingURL.url
    );

    // Create a CloudFront origin: S3 with fallback to Lambda when image needs to be transformed, otherwise with Lambda as sole origin
    var imageOrigin;

    imageOrigin = new origins.OriginGroup({
      primaryOrigin: origins.S3BucketOrigin.withOriginAccessControl(
        transformedImageBucket,
        {
          originShieldRegion: CLOUDFRONT_ORIGIN_SHIELD_REGION,
        }
      ),
      fallbackOrigin: new origins.HttpOrigin(imageProcessingDomainName, {
        originShieldRegion: CLOUDFRONT_ORIGIN_SHIELD_REGION,
      }),
      fallbackStatusCodes: [403, 500, 503, 504],
    });

    // write policy for Lambda on the s3 bucket for transformed images
    var s3WriteTransformedImagesPolicy = new iam.PolicyStatement({
      actions: ["s3:PutObject"],
      resources: ["arn:aws:s3:::" + transformedImageBucket.bucketName + "/*"],
    });
    iamPolicyStatements.push(s3WriteTransformedImagesPolicy);

    // attach iam policy to the role assumed by Lambda
    imageProcessing.role?.attachInlinePolicy(
      new iam.Policy(this, "read-write-bucket-policy", {
        statements: iamPolicyStatements,
      })
    );

    // // Create a CloudFront Function for url rewrites
    // const urlRewriteFunction = new cloudfront.Function(this, "urlRewrite", {
    //   code: cloudfront.FunctionCode.fromFile({
    //     filePath: "./lib/lambdas/url-rewrite/index.js",
    //   }),
    //   functionName: `urlRewriteFunction${this.node.addr}`,
    // });

    var imageDeliveryCacheBehaviorConfig: ImageDeliveryCacheBehaviorConfig = {
      origin: imageOrigin,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      compress: false,
      cachePolicy: new cloudfront.CachePolicy(
        this,
        `ImageCachePolicy${this.node.addr}`,
        {
          defaultTtl: Duration.hours(24),
          maxTtl: Duration.days(365),
          minTtl: Duration.seconds(0),
        }
      ),
      functionAssociations: [
        {
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          function: urlRewriteFunction,
        },
      ],
    };

    // Creating a custom response headers policy. CORS allowed for all origins.
    const imageResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      `ResponseHeadersPolicy${this.node.addr}`,
      {
        responseHeadersPolicyName: `ImageResponsePolicy${this.node.addr}`,
        corsBehavior: {
          accessControlAllowCredentials: false,
          accessControlAllowHeaders: ["*"],
          accessControlAllowMethods: ["GET"],
          accessControlAllowOrigins: ["*"],
          accessControlMaxAge: Duration.seconds(600),
          originOverride: false,
        },
        // recognizing image requests that were processed by this solution
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "x-aws-image-optimization",
              value: "v1.0",
              override: true,
            },
            { header: "vary", value: "accept", override: true },
          ],
        },
      }
    );
    imageDeliveryCacheBehaviorConfig.responseHeadersPolicy =
      imageResponseHeadersPolicy;

    const imageDelivery = new cloudfront.Distribution(
      this,
      "dripdropImageDeliveryDistribution",
      {
        certificate: certificate,
        domainNames: [cdnDomain],
        comment: "image optimization - image delivery",
        defaultBehavior: imageDeliveryCacheBehaviorConfig,
      }
    );

    // ADD OAC between CloudFront and LambdaURL
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: `oac${this.node.addr}`,
        originAccessControlOriginType: "lambda",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Route53 alias record for the CloudFront distribution
    new ARecord(this, "SiteAliasRecord", {
      recordName: cdnDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(imageDelivery)),
      zone,
    });

    const cfnImageDelivery = imageDelivery.node.defaultChild as CfnDistribution;
    cfnImageDelivery.addPropertyOverride(
      `DistributionConfig.Origins.${1}.OriginAccessControlId`,
      oac.getAtt("Id")
    );

    imageProcessing.addPermission("AllowCloudFrontServicePrincipal", {
      principal: new iam.ServicePrincipal("cloudfront.amazonaws.com"),
      action: "lambda:InvokeFunctionUrl",
      sourceArn: `arn:aws:cloudfront::${this.account}:distribution/${imageDelivery.distributionId}`,
    });

    new CfnOutput(this, "ImageDeliveryDomain", {
      description: "Domain name of image delivery",
      value: imageDelivery.distributionDomainName,
    });
  }
}
