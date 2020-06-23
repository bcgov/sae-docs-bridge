const compact = require('lodash/compact');
const config = require('config');
const nodeFetch = require('node-fetch');
const fetch = require('fetch-retry')(nodeFetch);

const { compare, wait } = require('../utils/helpers');
const log = require('../utils/log');

const host = config.get('host');
const documentTypes = config.get('documentTypes');

async function search(token, terms = []) {
  try {
    const keywords = compact(terms)
      .map(a => `"${a}"`)
      .join(' ');
    const response = await fetch(`${host}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        keywords,
        content: false,
        doc: false,
        tag: true,
        attachment: false,
      }),
      retryOn: [401],
      retries: 3,
      retryDelay: 1000,
    });
    const json = await response.json();
    log('[SUCCESS] Found %o article results', json.length);
    return json;
  } catch (err) {
    log('[FAILED] Unable to find articles. Reason: %o', err.message);
    throw new Error(err);
  }
}

async function getDocument(token, id) {
  try {
    const response = await fetch(`${host}/fetch/page/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      retryOn: [401],
      retries: 3,
      retryDelay: 1000,
    });
    const json = await response.json();
    log('[SUCCESS] Search article loaded');
    return json;
  } catch (err) {
    log('[FAILED] Search article %o', err.message);
    throw new Error(err);
  }
}

async function prefetch(applications, cache, token) {
  try {
    const results = await search(token, applications);
    const relevantResults = results.filter(d =>
      d.tags.split('#').some(tag => documentTypes.includes(tag)),
    );

    log('Caching %o articles', relevantResults.length);

    for (let index = 0; index < relevantResults.length; index++) {
      const result = relevantResults[index];
      const cachedDocument = cache.get(result.tags);
      const isInvalid = compare(result, cachedDocument);

      if (isInvalid) {
        const document = await getDocument(token, result.documentId);
        cache.set(result.tags, document);
        await wait();
      }
    }

    log('Cached %o articles', relevantResults.length);
  } catch (err) {
    log(err);
  }
}

module.exports = {
  getDocument,
  prefetch,
  search,
};
