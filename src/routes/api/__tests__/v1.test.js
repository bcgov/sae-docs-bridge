jest.mock('../../../services/help-provider');
const express = require('express');
const request = require('supertest');
const { getDocument, search } = require('../../../services/help-provider');

const auth = require('../../../middleware/auth');
const v1 = require('../v1');

const app = express();
app.use(
  auth({
    token: '123',
  }),
);
app.use('/', v1);

describe('api/v1', () => {
  it('should render empty root', async () => {
    const res = await request(app).get('/');
    expect(res.text).toEqual('Nothing to see here');
  });

  it('should handle a role if set', async () => {
    search.mockReturnValue([
      {
        documentId: '1',
        tags: '#ocwa#onboarding#exporter#',
      },
    ]);
    await request(app).get('/article/ocwa/onboarding?role=exporter');
    expect(search).toHaveBeenCalledWith('123', [
      'ocwa',
      'onboarding',
      'exporter',
    ]);
    expect(getDocument).toHaveBeenCalledWith('123', '1');
  });

  it('should throw the correct error', async () => {
    getDocument.mockRejectedValue(new Error('Broken'));
    const res = await request(app).get('/article/bsae/123');
    expect(res.status).toEqual(500);
  });

  it('should flush', async () => {
    const spy = jest.fn();
    app.on('flush', spy);
    const res = await request(app).get('/flush');

    expect(spy).toHaveBeenCalled();
    expect(res.text).toEqual('Cache flushed');
  });
});
