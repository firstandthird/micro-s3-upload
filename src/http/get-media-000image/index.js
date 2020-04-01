const { log, config, response, reply } = require('@firstandthird/arc-rapptor');
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
    const existingOptimizedImage = await getFromS3(config.folderOptimized, imageName);
    return {
      headers: {
        'Content-Type': mime.lookup(imageName)
      },
      isBase64Encoded: true,
      body: existingOptimizedImage.Body.toString('base64')
    };
  } catch (e) {
    log(['miss'], `${imageName} not found in ${config.folderOptimized}, will attempt to locate it in ${config.folderOriginals}`);
  }
  // if not, grab it from /originals
  try {
    const originalImage = await getFromS3(config.folderOriginals, imageName);
    // optimize it:
    try {
      const imageBuffer = await optimize({ quality: [config.quality, config.quality] }, originalImage.Body);
      // put it in /optimized
      await uploadToS3(`${config.folderOptimized}/${imageName}`, imageBuffer);
      return {
        headers: {
          'Content-Type': mime.lookup(imageName)
        },
        isBase64Encoded: true,
        body: imageBuffer.Body.toString('base64')
      };
    } catch (serverError) {
      log(['optimize'], serverError);
      return reply.text('Internal Error', { statusCode: 500 });
    }
  } catch (e) {
    return reply.text('Not Found', { statusCode: 404 });
  }
});
