const { config, response, reply } = require('@firstandthird/arc-rapptor');
const { render, env } = require('@firstandthird/arc-nunjucks');
const { cacheReply } = require('@firstandthird/arc-cache');
const querystring = require('querystring');
const arc = require('@architect/functions');
env.addGlobal('config', config.context);
env.addGlobal('static', (path) => arc.static(path, { stagePath: true }));

// eslint-disable-next-line require-await
exports.handler = response(cacheReply(async req => {
  const allowedFiles = config.allowedExtensions;
  const options = Object.assign({}, req.query);

  const inputId = options.inputId;
  const barColor = options.barColor;
  const bgColor = options.bgColor;
  const defaultImage = (options.defaultImage) ? options.defaultImage : false;
  const defaultText = (options.defaultText) ? options.defaultText.replace(/[<>/?=@(){};]/g, '') : 'Drop a file here or click to upload.';
  const showNotice = (options.showNotice === '1');
  let noticeText = '';
  if (showNotice) {
    const noticeArray = [];
    if (allowedFiles) {
      noticeArray.push(`Allowed: ${allowedFiles}`);
    }
    if (options.minheight) {
      noticeArray.push(`Minimum Height: ${options.minheight}px`);
    }
    if (options.minwidth) {
      noticeArray.push(`Minimum Width: ${options.minwidth}px`);
    }
    noticeText = noticeArray.join(', ');
  }

  delete options.inputId;
  delete options.barColor;
  delete options.bgColor;
  delete options.defaultImage;
  delete options.defaultText;

  return reply.html(render('single.njk', {
    config,
    options: querystring.stringify(options),
    inputId,
    barColor,
    bgColor,
    defaultImage,
    defaultText,
    noticeText,
    allowedFiles
  }), 200);
}, { ttl: config.replyCacheTTL }), {
  cors: true
});
