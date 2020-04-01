const { reply } = require('@firstandthird/arc-rapptor');

exports.handler = async (req) => reply.html('Not Found', { statusCode: 404 });
