import base64
import os
import io
import boto3
from PIL import Image, UnidentifiedImageError

# Initialize S3 client
s3_client = boto3.client('s3')

# Environment variables
S3_ORIGINAL_IMAGE_BUCKET = os.getenv('originalImageBucketName')
S3_TRANSFORMED_IMAGE_BUCKET = os.getenv('transformedImageBucketName')
TRANSFORMED_IMAGE_CACHE_TTL = os.getenv('transformedImageCacheTTL', 'max-age=3600')
MAX_IMAGE_SIZE = int(os.getenv('maxImageSize', '6291456'))  # 6MB max size
TARGET_SIZE = 1048576  # 1MB target size

# Supported image formats
FORMAT_MAP = {
    'jpeg': 'JPEG',
    'jpg': 'JPEG',
    'gif': 'GIF',
    'webp': 'WEBP',
    'png': 'PNG',
    'avif': 'AVIF'
}

def handler(event, context):
    # Validate if this is a GET request
    if not event.get("requestContext") or event["requestContext"].get("http", {}).get("method") != 'GET':
        return send_error(400, 'Only GET method is supported')

    # Parse path to get original image path and operations
    image_path_array = event["requestContext"]["http"]["path"].strip('/').split('/')
    operations_prefix = image_path_array.pop()
    original_image_path = '/'.join(image_path_array)

    # Download the original image
    try:
        response = s3_client.get_object(Bucket=S3_ORIGINAL_IMAGE_BUCKET, Key=original_image_path)
        original_image_body = response['Body'].read()
        content_type = response['ContentType']

    except Exception as e:
        return send_error(500, 'Error downloading original image', e)

    # Process and transform the image
    try:
        image = Image.open(io.BytesIO(original_image_body))
        operations = dict(op.split('=') for op in operations_prefix.split(','))

        # Get requested resize parameters
        width = int(operations.get('width', image.width))
        height = int(operations.get('height', image.height))

        # **Aggressive downscaling while maintaining aspect ratio**
        if len(original_image_body) > 2 * TARGET_SIZE:  # If original image is > 2MB
            width = max(width // 2, 800)  # Reduce width by 50%, min width = 800px
            height = max(height // 2, 600)  # Reduce height by 50%, min height = 600px
            image.thumbnail((width, height), Image.LANCZOS)  # Preserves aspect ratio

        # Resize to user-specified width/height if provided (while keeping aspect ratio)
        image.thumbnail((width, height), Image.LANCZOS)

        # Determine output format
        requested_format = operations.get('format', '').lower()
        image_format = FORMAT_MAP.get(requested_format, image.format)
        content_type = f'image/{requested_format}' if requested_format else content_type

        # Ensure correct color mode
        if image_format in ['JPEG', 'WEBP', 'AVIF'] and image.mode not in ['RGB', 'RGBA']:
            image = image.convert('RGB')

        # Convert image to bytes
        transformed_image = io.BytesIO()
        quality = int(operations.get('quality', 75)) if 'quality' in operations else 75
        save_params = {'format': image_format, 'quality': quality} if image_format in ['JPEG', 'WEBP', 'AVIF'] else {'format': image_format}

        if image_format == 'PNG':
            save_params['optimize'] = True

        image.save(transformed_image, **save_params)
        transformed_image.seek(0)

        # **Progressive Reduction (Quality & Size) Until Below 1MB
        while transformed_image.getbuffer().nbytes > TARGET_SIZE and quality > 30:
            transformed_image = io.BytesIO()
            quality -= 10  # Reduce quality step-by-step
            image.save(transformed_image, format=image_format, quality=quality)
            transformed_image.seek(0)

        # **Final Resizing if Still Too Big (Maintaining Aspect Ratio)
        while transformed_image.getbuffer().nbytes > TARGET_SIZE and width > 500 and height > 400:
            width = max(width - 100, 500)  # Reduce width but keep aspect ratio
            height = int((width / image.width) * image.height)  # Adjust height to maintain aspect ratio
            image.thumbnail((width, height), Image.LANCZOS)
            transformed_image = io.BytesIO()
            image.save(transformed_image, format=image_format, quality=quality)
            transformed_image.seek(0)

        # Final Check
        if transformed_image.getbuffer().nbytes > MAX_IMAGE_SIZE:
            return send_error(403, 'Final transformed image is still too large')

    except UnidentifiedImageError as e:
        return send_error(500, 'Error processing image', e)

    # **Upload transformed image to S3
    try:
        s3_client.put_object(
            Bucket=S3_TRANSFORMED_IMAGE_BUCKET,
            Key=f"{original_image_path}/{operations_prefix}",
            Body=transformed_image.getvalue(),
            ContentType=content_type,
            CacheControl=TRANSFORMED_IMAGE_CACHE_TTL
        )
    except Exception as e:
        log_error('Could not upload transformed image to S3', e)

    # Return transformed image
    return {
        'statusCode': 200,
        'body': base64.b64encode(transformed_image.getvalue()).decode('utf-8'),
        'isBase64Encoded': True,
        'headers': {
            'Content-Type': content_type,
            'Cache-Control': TRANSFORMED_IMAGE_CACHE_TTL
        }
    }

def send_error(status_code, message, error=None):
    log_error(message, error)
    return {'statusCode': status_code, 'body': message}

def log_error(message, error=None):
    print('APPLICATION ERROR:', message)
    if error:
        print(error)
