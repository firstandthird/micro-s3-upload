const { log, config, response, reply } = require('@firstandthird/arc-rapptor');
const { optimize } = require('optimiz');
const uploadToS3 = require('./uploadToS3');
const getFromS3 = require('./getFromS3');
const mime = require('mime-types');

// eslint-disable-next-line require-await
exports.handler = response(async req => {
  let imageName = req.pathParameters.image;
  // see if it exists in optimizedFolder
  // if so just return that
  const existingOptimizedImage = await getFromS3(config.folderOptimized, imageName);
  if (existingOptimizedImage) {
    return {
      headers: {
        'Cache-Control': 'max-age=31536000',
        'Content-Type': mime.lookup(imageName)
      },
      isBase64Encoded: true,
      body: existingOptimizedImage.Body.toString('base64')
    };
  }
  log(['miss'], `${imageName} not found in ${config.folderOptimized}, will attempt to locate it in ${config.folderOriginals}`);
  // if not, grab it from originalFolder
  const originalImage = await getFromS3(config.folderOriginals, imageName);
  if (!originalImage) {
    return reply.text('Not Found', { statusCode: 404 });
  }
  // set up optimization params
  // must be at least min image size:
  const width = req.queryStringParameters.w > config.minimumImageSize.width ?
    req.queryStringParameters.w : config.minimumImageSize.width;
  const height = req.queryStringParameters.h > config.minimumImageSize.height ?
    req.queryStringParameters.h : config.minimumImageSize.height;
  // default is 'resize'
  const type = req.queryStringParameters.resize || false;
  // set params based on whetehr resizing, covering or containing:
  const params = { width, height, type };
  // determine new file name:
  if (type === 'resize') {
    const imageBaseTokens = imageName.split('.');
    const newBaseName = imageBaseTokens.slice(0, imageBaseTokens.length - 1).join('.');
    imageName = `${newBaseName}_${type}_${width}_${height}.${imageBaseTokens[imageBaseTokens.length - 1]}`;
  }
  // optimize it:
  try {
    const imageBuffer = await optimize.resize(params, originalImage.Body);
    // put it in /optimized
    await uploadToS3(`${config.folderOptimized}/${imageName}`, imageBuffer);
    return {
      headers: {
        'Cache-Control': 'max-age=31536000',
        'Content-Type': mime.lookup(imageName)
      },
      isBase64Encoded: true,
      body: imageBuffer.toString('base64')
    };
  } catch (serverError) {
    log(['optimize'], serverError);
    return reply.text('Internal Error', { statusCode: 500 });
  }
});
