const { reply } = require('@firstandthird/arc-rapptor');

exports.handler = (req) => reply.html('Not Found', { statusCode: 404 });
