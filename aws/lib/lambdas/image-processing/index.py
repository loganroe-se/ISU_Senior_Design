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
TARGET_SIZE = 2 * 1024 * 1024  # 2MB
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8MB

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
    if not event.get("requestContext") or event["requestContext"].get("http", {}).get("method") != 'GET':
        return send_error(400, 'Only GET method is supported')

    # Parse S3 key
    image_path_array = event["requestContext"]["http"]["path"].strip('/').split('/')
    operations_prefix = image_path_array.pop()
    original_image_path = '/'.join(image_path_array)

    try:
        print("Path: ", original_image_path)
        response = s3_client.get_object(Bucket=S3_ORIGINAL_IMAGE_BUCKET, Key=original_image_path)
        original_image_body = response['Body'].read()
        content_type = response['ContentType']
    except Exception as e:
        return send_error(500, 'Error downloading original image', e)

    try:
        image = Image.open(io.BytesIO(original_image_body))
        operations = dict(op.split('=') for op in operations_prefix.split(','))

        width = int(operations.get('width', image.width))
        height = int(operations.get('height', image.height))

        # Resize only if user requested
        if 'width' in operations or 'height' in operations:
            image.thumbnail((width, height), Image.LANCZOS)

        # Determine format
        requested_format = operations.get('format', '').lower()
        image_format = FORMAT_MAP.get(requested_format, image.format)
        content_type = f'image/{requested_format}' if requested_format else content_type

        if image_format in ['JPEG', 'WEBP', 'AVIF'] and image.mode not in ['RGB', 'RGBA']:
            image = image.convert('RGB')

        quality = int(operations.get('quality', 75)) if 'quality' in operations else 75
        save_params = {'format': image_format, 'quality': quality} if image_format in ['JPEG', 'WEBP', 'AVIF'] else {'format': image_format}
        if image_format == 'PNG':
            save_params['optimize'] = True

        transformed_image = io.BytesIO()
        image.save(transformed_image, **save_params)
        transformed_image.seek(0)

        # Compress only if too big
        if transformed_image.getbuffer().nbytes > TARGET_SIZE and image_format in ['JPEG', 'WEBP', 'AVIF']:
            while transformed_image.getbuffer().nbytes > TARGET_SIZE and quality > 30:
                quality -= 10
                transformed_image = io.BytesIO()
                image.save(transformed_image, format=image_format, quality=quality)
                transformed_image.seek(0)

        # Reject if still too large
        if transformed_image.getbuffer().nbytes > MAX_IMAGE_SIZE:
            return send_error(403, 'Final transformed image is still too large')

    except UnidentifiedImageError as e:
        return send_error(500, 'Error processing image', e)

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
