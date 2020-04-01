const { config, response, reply } = require('@firstandthird/arc-rapptor');
const { optimize } = require('optimiz');
const uploadToS3 = require('./uploadToS3');
const getFromS3 = require('./getFromS3');
const mime = require('mime-types');

// eslint-disable-next-line require-await
exports.handler = response(async req => {
  const imageName = req.pathParameters.image;
  // see if it exists in /optimized
  try {
    // if so just return that
    const existingOptimizedImage = await getFromS3('optimized', imageName);
    return {
      headers: {
        'Content-Type': mime.lookup(imageName)
      },
      isBase64Encoded: true,
      body: existingOptimizedImage.Body.toString('base64')
    };
  } catch (e) {
    console.log(`${imageName}' not found in /optimized, will attempt to locate it in /originals`);
  }
  // if not, grab it from /originals
  try {
    const originalImage = await getFromS3('originals', imageName);
    // optimize it:
    try {
      const imageBuffer = await optimize({ quality: [config.quality, config.quality] }, originalImage.Body);
      // put it in /optimized
      await uploadToS3(`optimized/${imageName}`, imageBuffer);
      return {
        headers: {
          'Content-Type': mime.lookup(imageName)
        },
        isBase64Encoded: true,
        body: imageBuffer.Body.toString('base64')
      };
    } catch (serverError) {
      return reply.html(serverError, 500);
    }
  } catch (e) {
    return reply.html(`${imageName} does not exist in ${config.s3.bucket}/originals`, 404);
  }
});
