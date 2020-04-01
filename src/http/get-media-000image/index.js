const { config, response, reply } = require('@firstandthird/arc-rapptor');
const { optimize } = require('optimiz');
const uploadToS3 = require('./uploadToS3');
const getFromS3 = require('./getFromS3');

// eslint-disable-next-line require-await
exports.handler = response(async req => {
  const imageName = req.pathParameters.image;
  // see if it exists in /optimized
  try {
    // if so just return that
    const existingOptimizedImage = await getFromS3('optimized', imageName);
    return reply.html(existingOptimizedImage.Body);
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
      const image = await uploadToS3(`optimized/${imageName}`, imageBuffer);
      // todo: return the raw image or the location from s3?
      return reply.html(image);
    } catch (serverError) {
      return reply.html(serverError, 500);
    }
  } catch (e) {
    return reply.html(`${imageName} does not exist in /originals`, 404);
  }
});
