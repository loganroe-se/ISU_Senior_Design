#!/bin/bash
creds=$(aws sts assume-role --role-arn "arn:aws:iam::626635444817:role/AmazonSSMRoleForInstancesQuickSetup" --role-session-name "RDSPortForwardingSession" --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" --output text)

export AWS_ACCESS_KEY_ID=$(echo $creds | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $creds | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $creds | awk '{print $3}')

aws ssm start-session --target i-065c5ae1a8472eaec --region us-east-1 --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"host":["mainapi-apiconstructauroraclustera3d91959-metfrybjzs7r.c7qik8o6ytrt.us-east-1.rds.amazonaws.com"], "portNumber":["3306"], "localPortNumber":["3306"]}'
