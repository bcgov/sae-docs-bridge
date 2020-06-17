'use strict';
const compact = require('lodash/compact');
const NodeCache = require('node-cache');

const std = 60 * 60 * 48;
const nodeCache = new NodeCache({
  stdTLL: std,
  checkPeriod: std * 0.2,
  useClones: false,
});

class Cache {
  constructor(cache) {
    this.cache = cache;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (Array.isArray(key)) {
      this.cache.mset(key);
    } else {
      this.cache.set(key, value);
    }
  }

  flush() {
    this.cache.flushAll();
  }
}

const cache = new Cache(nodeCache);

function middleware(req, res, next) {
  try {
    const { app, keyword } = req.params;
    const { role } = req.query;
    const terms = [app, keyword, role];
    const key = compact(terms).join('#');
    const cached = nodeCache.get(`#${key}#`);

    if (cached) {
      return res.json(cached);
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = cache;
module.exports.middleware = middleware;
