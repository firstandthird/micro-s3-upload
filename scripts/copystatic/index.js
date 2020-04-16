const AWS = require('aws-sdk');
const fs = require('fs');
const globby = require('globby');
const s3 = new AWS.S3();

exports.handler = async () => {
  const files = await globby('./static/**/*');

  const promises = files.map(async file => {
    const data = fs.readFileSync(file);

    return new Promise((resolve, reject) => {
      s3.putObject({
        Bucket: process.env.ARC_STATIC_BUCKET,
        Key: file.replace('./static/', ''),
        Body: Buffer.from(data, 'base64'),
        ACL: 'public-read'
      }, (err, resp) => {
        if (err) {
          console.log(err, err.stack);
          return reject(err);
        }
        return resolve();
      });
    });
  });

  await Promise.all(promises)

  return 'ok';
};
