const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION
});

async function subirFoto(buffer, filename, mimetype) {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
}

module.exports = { subirFoto };