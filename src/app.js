const config = require('config');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const Cache = require('./services/cache');
const authMiddleware = require('./middleware/auth');
const cacheMiddleware = require('./middleware/cache');
const v1 = require('./routes/api/v1');

// Config
const applications = config.get('applications');
const token = config.get('token');
const whitelist = config.get('whitelist');
const format = config.get('morganFormat');
const cache = new Cache();

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.length === 0 || whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS ' + origin));
    }
  },
};
const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(format));
}

app.use([
  authMiddleware({
    token,
    app,
    applications,
  }),
  cacheMiddleware(cache),
  cors(corsOptions),
]);
app.use('/api/v1', v1);

module.exports = {
  boot() {
    return app;
  },
};
