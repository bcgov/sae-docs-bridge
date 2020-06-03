const compact = require('lodash/compact');
const express = require('express');

const cache = require('../../services/cache');
const { getDocument, search } = require('../../services/help-provider');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Nothing to see here');
});

router.get('/flush', (req, res, done) => {
  cache.flush();
  res.send('Cache flushed');
  req.app.emit('flush');
  done();
});

router.get(
  '/article/:app/:keyword',
  cache.middleware,
  async (req, res, next) => {
    const { token } = req;
    const { app, keyword } = req.params;
    const { role } = req.query;
    const terms = compact([app, keyword, role]);

    try {
      const searchResults = await search(token, terms);
      const result = searchResults.find(d => {
        const tags = compact(d.tags.split('#'));
        return tags.every(t => terms.includes(t));
      });
      const id = result && result.documentId;
      const document = await getDocument(token, id);

      res.json(document);
    } catch (err) {
      next(err);
    }

    next();
  },
);

module.exports = router;
