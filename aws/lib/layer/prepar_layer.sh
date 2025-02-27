#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Install dependencies from requirements.txt into the ./python directory
pip install -r requirements.txt -t ./python

# Move all Python files into the ./python directory
cp *.py ./python/