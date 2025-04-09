#!/bin/bash

# Assume the IAM role for the Bastion Host (Amazon SSM Role)
creds=$(aws sts assume-role \
    --role-arn "arn:aws:iam::626635444817:role/AmazonSSMRoleForInstancesQuickSetup" \
    --role-session-name "RDSPortForwardingSession" \
    --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" \
    --output text)

# Extract AWS credentials
export AWS_ACCESS_KEY_ID=$(echo $creds | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $creds | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $creds | awk '{print $3}')


# Manually set instance ID if not using dynamic retrieval
BASTION_INSTANCE_ID="i-088103e6f1fefb84e"

# Define the correct RDS Proxy endpoint (Ensure it is correct from AWS Console or CDK output)
RDS_PROXY_ENDPOINT="dripdropapi-databaseconstructauroraclusterc63176ed-mvuq6uhwg6qi.c7qik8o6ytrt.us-east-1.rds.amazonaws.com"

# Start AWS Systems Manager (SSM) Port Forwarding Session
aws ssm start-session \
    --target $BASTION_INSTANCE_ID \
    --region us-east-1 \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "{\"host\":[\"$RDS_PROXY_ENDPOINT\"], \"portNumber\":[\"3306\"], \"localPortNumber\":[\"3308\"]}"
