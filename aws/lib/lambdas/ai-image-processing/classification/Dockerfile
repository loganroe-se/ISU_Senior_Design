# Use a minimal Python 3.12 base image
FROM python:3.12-slim

# Set environment variables to force CPU usage
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    FORCE_CUDA=0

# Install only necessary system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install dependencies in a virtual environment to reduce size
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install only necessary Ultralytics components (avoid full package if not needed)
RUN pip install --no-cache-dir ultralytics[export] awslambdaric

# Copy application files (ensure minimal file copying)
COPY src/ ./

# Set AWS Lambda runtime entrypoint
ENTRYPOINT [ "python", "-m", "awslambdaric" ]

# Set the Lambda function handler
CMD ["classification_lambda.handler"]
