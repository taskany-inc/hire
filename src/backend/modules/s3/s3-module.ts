import {
    S3Client,
    PutObjectCommand,
    PutObjectRequest,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';

import config from '../../config';

export const client = new S3Client({
    forcePathStyle: true,
    region: config.s3.region,
    endpoint: config.s3.endpoint,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
    },
});

export const loadPic = async (key: string, data: PutObjectRequest['Body'] | string, contentType: string) => {
    try {
        await client.send(
            new PutObjectCommand({
                Bucket: config.s3.bucket,
                BucketKeyEnabled: false,
                Key: `section/${key}`,
                Body: data,
                ACL: 'authenticated-read',
                ContentType: contentType,
                CacheControl: 'no-cache',
            }),
        );
    } catch (error) {
        return error instanceof Error ? error.message : 'Upload error';
    }
};

export const removePic = async (key: string) => {
    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
    });

    return client.send(deleteObjectCommand);
};

export const getObject = (key: string) => {
    const getObjectCommand = new GetObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
    });

    return client.send(getObjectCommand);
};
