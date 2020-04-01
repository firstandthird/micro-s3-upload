const AWS = require('aws-sdk');
const { config } = require('@firstandthird/arc-rapptor');

module.exports = async(folder, name) => {
  const aws = new AWS.S3();
  const params = {
    Bucket: config.s3.bucket,
    Key: `${folder}/${name}`
  };
  return aws.getObject(params).promise();
};
