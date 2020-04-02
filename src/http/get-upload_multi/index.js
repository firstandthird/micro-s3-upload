const { config, response, reply } = require('@firstandthird/arc-rapptor');
const { render, env } = require('@firstandthird/arc-nunjucks');
const { cacheReply } = require('@firstandthird/arc-cache');
const arc = require('@architect/functions');
env.addGlobal('config', config.context);
env.addGlobal('static', (path) => arc.static(path, { stagePath: true }));

// eslint-disable-next-line require-await
exports.handler = response(cacheReply(async req => {
  return reply.html(render('multiple.njk', {
    config
  }), 200);
}, { ttl: config.replyCacheTTL }), {
  cors: true
});
