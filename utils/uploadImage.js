const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
});

const uploadImage = async (file, fileName) => {
    if (!file || !file.buffer) throw new Error("Invalid file");

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ACL: 'public-read',
    };

    await s3.upload(params).promise();

    return `${process.env.S3_PUBLIC_URL}${fileName}`;
};

module.exports = { uploadImage };
