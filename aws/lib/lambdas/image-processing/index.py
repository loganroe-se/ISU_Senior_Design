import base64
import os
import io
import boto3
from PIL import Image, ImageOps, UnidentifiedImageError

# Initialize S3 client
s3_client = boto3.client('s3')

# Environment variables
S3_ORIGINAL_IMAGE_BUCKET = os.getenv('originalImageBucketName')
S3_TRANSFORMED_IMAGE_BUCKET = os.getenv('transformedImageBucketName')
TRANSFORMED_IMAGE_CACHE_TTL = os.getenv('transformedImageCacheTTL', 'max-age=3600')
MAX_IMAGE_SIZE = int(os.getenv('maxImageSize', '6291456'))  # default of 6MB

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

    # Perform transformations
    try:
        image = Image.open(io.BytesIO(original_image_body))
        operations = dict(op.split('=') for op in operations_prefix.split(','))

        # Resize if requested
        resize_options = {k: int(v) for k, v in operations.items() if k in ['width', 'height']}
        if resize_options:
            image = ImageOps.fit(image, (resize_options.get('width', image.width),
                                         resize_options.get('height', image.height)))

        # Convert format if requested
        if 'format' in operations:
            format_map = {
                'jpeg': 'JPEG',
                'gif': 'GIF',
                'webp': 'WEBP',
                'png': 'PNG',
                'avif': 'AVIF'
            }
            requested_format = operations['format']
            image_format = format_map.get(requested_format, 'JPEG')
            content_type = f'image/{requested_format}'
            image = image.convert('RGB') if image_format in ['JPEG', 'WEBP', 'AVIF'] else image
        else:
            image_format = 'PNG' if content_type == 'image/svg+xml' else image.format

        # Convert to bytes
        transformed_image = io.BytesIO()
        quality = int(operations.get('quality', 75)) if 'quality' in operations else None
        if quality is not None:
            image.save(transformed_image, format=image_format, quality=quality)
        else:
            image.save(transformed_image, format=image_format)


        transformed_image.seek(0)

        # Check size
        if len(transformed_image.getvalue()) > MAX_IMAGE_SIZE:
            return send_error(403, 'Requested transformed image is too big')

    except UnidentifiedImageError as e:
        return send_error(500, 'Error processing image', e)

    # Upload transformed image back to S3 if required
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

    # Return the transformed image
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
