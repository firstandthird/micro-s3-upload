const { log, config, response, reply } = require('@firstandthird/arc-rapptor');
const { optimize, resize } = require('optimiz');
const uploadToS3 = require('./uploadToS3');
const getFromS3 = require('./getFromS3');
const mime = require('mime-types');

// eslint-disable-next-line require-await
exports.handler = response(async req => {
  const originalImageName = req.pathParameters.image;
  let imageName = originalImageName;
  const imageBaseTokens = imageName.split('.');
  const newBaseName = imageBaseTokens.slice(0, imageBaseTokens.length - 1).join('.');
  const type = req.queryStringParameters.type || false;
  const width = req.queryStringParameters.w > config.minimumImageSize.width ?
    req.queryStringParameters.w : config.minimumImageSize.width;
  const height = req.queryStringParameters.h > config.minimumImageSize.height ?
    req.queryStringParameters.h : config.minimumImageSize.height;
  const doResize = (req.queryStringParameters.w || req.queryStringParameters.h) &&
    (type === 'resize' || type === 'cover' || type === 'contain');
  // get the resize name if we are going to adjust the image:
  if (doResize) {
    // default is 'resize'
    imageName = `${newBaseName}_${type}_${width}_${height}.${imageBaseTokens[imageBaseTokens.length - 1]}`;
  }
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
  const originalImage = await getFromS3(config.folderOriginals, originalImageName);
  if (!originalImage) {
    return reply.text('Not Found', { statusCode: 404 });
  }
  // resize/cover/contain the image if requested:
  let resizedImage = originalImage.Body;
  if (doResize) {
    // set params based on whetehr resizing, covering or containing:
    const params = { width: parseInt(width, 10), height: parseInt(height, 10), type };
    try {
      resizedImage = await resize(params, resizedImage);
    } catch (serverError) {
      log(['optimize'], serverError);
      return reply.text('Internal Error', { statusCode: 500 });
    }
  }

  // always optimize it:
  try {
    const imageBuffer = await optimize({ quality: config.quality }, resizedImage);
    // put it in /optimized
    await uploadToS3(`${config.folderOptimized}/${imageName}`, imageBuffer);
    return {
      headers: {
        'Cache-Control': 'max-age=31536000',
        'Content-Type': mime.lookup(imageName)
      },
      statusCode: 200,
      isBase64Encoded: true,
      body: imageBuffer.toString('base64')
    };
  } catch (serverError) {
    log(['optimize'], serverError);
    return reply.text('Internal Error', { statusCode: 500 });
  }
});
