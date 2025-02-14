# Use AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt -t .

# Copy all files in ./src
COPY src/* ${LAMBDA_TASK_ROOT}

# Set the handler
CMD ["classification_lambda.handler"]
