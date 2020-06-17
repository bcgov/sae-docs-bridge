const compact = require('lodash/compact');
const config = require('config');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const cache = require('./services/cache');
const log = require('./utils/log');
const { prefetch } = require('./services/help-provider');
const v1 = require('./routes/api/v1');

// Config
const applications = config.get('applications');
const token = config.get('token');
const whitelist = config.get('whitelist');
const format = config.get('morganFormat');

const corsOptions = {
  origin(origin, callback) {
    if (
      compact(whitelist).length === 0 ||
      whitelist.indexOf(origin) !== -1 ||
      !origin
    ) {
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
  }),
  cors(corsOptions),
]);
app.use('/api/v1', v1);

// Catch the flush event and refresh cache
app.on('flush', () => prefetch(applications, cache, token));

module.exports = {
  boot() {
    prefetch(applications, cache, token);
    return app;
  },
};
