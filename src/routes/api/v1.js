const express = require('express');

const { getDocument } = require('../../services/help-provider');

const router = express.Router();

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

    res.json(document);
  } catch (err) {
    next(err);
  }

  next();
});

module.exports = router;
