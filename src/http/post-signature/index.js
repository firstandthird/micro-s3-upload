const awsAuth = require('aws-creds');
const AWS = require('aws-sdk');
const { response, reply, config } = require('@firstandthird/arc-rapptor');
const mime = require('mime');

// eslint-disable-next-line require-await
exports.handler = response(async req => {
  const s3 = awsAuth(AWS, 'S3', config.s3);
  const body = req.body;
  const key = `${config.s3.folder}${new Date().getUTCFullYear()}/${body.filename}`;
  const contentType = mime.getType(body.filename);

  const params = {
    Bucket: config.s3.bucket,
    Fields: {
      key
    },
    Conditions: [
      { acl: 'public-read' },
      { bucket: config.s3.bucket },
      ['starts-with', '$key', key],
      { success_action_status: '200' },
      { 'content-type': contentType }
    ]
  };

  const signature = await s3.createPresignedPost(params);

  signature.contentType = contentType;

  return reply.json({ signature }, 200);
});
