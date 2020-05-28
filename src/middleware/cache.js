function cacheMiddleware(cache) {
  return async (req, res, next) => {
    const { app, keyword } = req.params;
    const { role } = req.query;

    const cached = await cache.get(
      `${app}-${keyword}-${role}`,
      async doc => doc,
    );

    if (cached) {
      return res.json(cached);
    }

    next();
  };
}

module.exports = cacheMiddleware;
