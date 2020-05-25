const NodeCache = require('node-cache');

class Cache {
  constructor() {
    const std = 60 * 60 * 48;
    this.cache = new NodeCache({
      stdTLL: std,
      checkPeriod: std * 0.2,
      useClones: false,
    });
  }

  get(key, fn) {
    const value = this.cache.get(key);

    if (value) {
      return Promise.resolve(value);
    }

    return fn().then(result => {
      this.cache.set(key, result);
      return result;
    });
  }

  flush() {
    this.cache.flushAll();
  }
}

module.exports = Cache;
