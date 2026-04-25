import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  },
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000', // Default to local MinIO
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'platform-photos';

export async function uploadToS3(key: string, buffer: Buffer, mimeType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);
  
  // Return the path style URL or the object key. We'll store the key and generate presigned URLs for reading.
  return key; 
}

export async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  // URL valid for 1 hour
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
