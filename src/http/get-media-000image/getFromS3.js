const AWS = require('aws-sdk');
const { config } = require('@firstandthird/arc-rapptor');

module.exports = async(folder, name) => {
  try {
    const aws = new AWS.S3();
    const params = {
      Bucket: config.s3.bucket,
      Key: `${folder}/${name}`
    };
    const result = await aws.getObject(params).promise();
    return result;
  } catch (e) {
    return false;
  }
};
