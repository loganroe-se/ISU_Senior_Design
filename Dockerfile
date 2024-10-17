FROM ubuntu:20.04

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    python3 \
    python3-pip

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install

# Install Node.js 18.x and AWS CDK
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g aws-cdk
