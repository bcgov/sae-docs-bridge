const express = require('express');

const Cache = require('../../services/cache');
const { getDocument } = require('../../services/help-provider');

const router = express.Router();
const cache = new Cache();

router.get('/', (req, res) => {
  res.send('Nothing to see here');
});

router.get('/article/:app/:keyword', async (req, res, next) => {
  const { token } = req;
  const { apps } = req.app.locals;
  const { app, keyword } = req.params;
  const { role } = req.query;

  if (!apps) {
    res.sendStatus(404);
    return next();
  }

  try {
    const response = await cache.get(`${app}-${keyword}`, async () => {
      const result = apps
        .filter(d => d.tags.split('#').includes(app))
        .filter(d => {
          if (role) {
            return d.tags.split('#').includes(role);
          }
          return true;
        })
        .find(d => d.tags.split('#').includes(keyword));
      const id = result && result.documentId;
      const document = await getDocument(token, id);
      return document;
    });

    res.json(response);
  } catch (err) {
    next(err);
  }

  next();
});

module.exports = router;
