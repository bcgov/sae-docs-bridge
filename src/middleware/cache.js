const compact = require('lodash/compact');

class CacheMiddleware {
  constructor(cache) {
    this.cache = cache;
  }

  async middleware(req, res, next) {
    const { app, keyword } = req.params;
    const { role } = req.query;
    const key = compact([app, keyword, role]).join('#');
    const cached = this.cache.get(`#${key}#`);

    if (cached) {
      return res.json(cached);
    }

    next();
  }
}

module.exports = CacheMiddleware;
