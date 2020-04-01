const AWS = require('aws-sdk');
const { config } = require('@firstandthird/arc-rapptor');

module.exports = (key, body) => {
  const aws = new AWS.S3();
  return aws.upload({
    Bucket: config.s3.bucket,
    Key: key,
    Body: body,
  }).promise();
};
