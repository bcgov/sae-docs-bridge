jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const auth = require('../auth');
const fetchMock = require('node-fetch');

fetchMock.config.overwriteRoutes = true;

describe('services/auth', () => {
  afterEach(() => {
    auth.reset();
    fetchMock.mockClear();
  });

  describe('#init', () => {
    it('should initialize and setup', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: 'abc',
      });

      await expect(auth.init('https://help-api/api', '123')).resolves.toEqual(
        'abc',
      );

      expect(fetchMock.mock.calls[0][0]).toEqual(
        'https://help-api/api/public/authenticate',
      );
      expect(fetchMock.mock.calls[0][1]).toEqual({
        method: 'POST',
        headers: {
          Authorization: 'Basic 123',
          'Cache-Control': 'no-cache',
        },
      });
    });

    it('should thrown an error', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', 500);
      await expect(auth.init('https://help-api/api', '123')).rejects.toThrow();
    });
  });

  describe('#getToken', () => {
    it('should request a token if getToken is empty', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: 'cde',
      });
      await expect(auth.getToken()).resolves.toEqual('cde');
    });

    it('should throw an error if get fails', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', 500);
      await expect(auth.getToken()).rejects.toThrow();
    });

    it('should return a saved value', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: 'abc',
      });
      await auth.init();
      await expect(auth.getToken()).resolves.toEqual('abc');
    });
  });

  describe('#middleware', () => {
    it('should attach a token value to req', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: 'abc',
      });
      const next = jest.fn();
      const req = {};
      await auth.init();
      auth.middleware(req, {}, next);
      expect(req).toEqual({
        token: 'abc',
      });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
