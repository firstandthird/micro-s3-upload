const { config, response, reply } = require('@firstandthird/arc-rapptor');
const { render, env } = require('@firstandthird/arc-nunjucks');
const { cacheReply } = require('@firstandthird/arc-cache');
env.addGlobal('config', config.context);

// eslint-disable-next-line require-await
exports.handler = response(cacheReply(async req => {
  return reply.html(render('view.njk', {
    config
  }), 200);
}, { ttl: config.replyCacheTTL }), {
  cors: true
});
