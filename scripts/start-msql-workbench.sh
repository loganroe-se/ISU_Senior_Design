#!/bin/bash
creds=$(aws sts assume-role --role-arn "arn:aws:iam::626635444817:role/AmazonSSMRoleForInstancesQuickSetup" --role-session-name "RDSPortForwardingSession" --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" --output text)

export AWS_ACCESS_KEY_ID=$(echo $creds | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $creds | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $creds | awk '{print $3}')

aws ssm start-session --target i-01362d431285687e6 --region us-east-1 --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"host":["dripdropapidatabaseconstruauroraclusterdripdropproxye03e036d.proxy-c7qik8o6ytrt.us-east-1.rds.amazonaws.com"], "portNumber":["3306"], "localPortNumber":["3306"]}'
