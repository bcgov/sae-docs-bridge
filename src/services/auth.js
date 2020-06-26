const config = require('config');
const { decode } = require('jsonwebtoken');
const nodeFetch = require('node-fetch');
const fetch = require('fetch-retry')(nodeFetch);
const log = require('../utils/log');

const userToken = config.get('token');
const host = config.get('host');
let token = null;

async function init() {
  token = await authenticate(host, userToken);
  return token;
}

async function authenticate() {
  try {
    const response = await fetch(`${host}/public/authenticate`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${userToken}`,
        'Cache-Control': 'no-cache',
      },
    });
    const json = await response.json();

    log('[SUCCESS] Authenticated');

    return json.token;
  } catch (err) {
    log('[FAILED] Authentication failed. Reason: %o', err.message);
    throw new Error(err);
  }
}

// Returns true if still valid
function verify(t = token) {
  const decoded = decode(t);

  if (!decoded) {
    return false;
  }

  return Date.now() < decoded.exp * 1000;
}

async function getToken() {
  if (!token || !verify()) {
    try {
      token = await authenticate();
      return token;
    } catch (err) {
      throw new Error(err);
    }
  }

  return Promise.resolve(token);
}

async function hoc(func, ...rest) {
  const token = await getToken();
  func.call(null, ...rest, token);
}

function middleware() {
  return async function(req, res, next) {
    if (token && verify()) {
      req.token = token;
      return next();
    }

    try {
      token = await authenticate();
      req.token = token;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/* istanbul ignore next */
function reset() {
  if (process.env.NODE_ENV === 'test') {
    token = null;
  }
}

module.exports = {
  authenticate,
  getToken,
  hoc,
  init,
  middleware,
  reset,
  verify,
};
