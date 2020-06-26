jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const auth = require('../auth');
const fetchMock = require('node-fetch');
const jwt = require('jsonwebtoken');

fetchMock.config.overwriteRoutes = true;

const expiredToken = jwt.sign({}, 's3cr3t', {
  expiresIn: '1',
});
const validToken = jwt.sign({}, 's3cr3t', {
  expiresIn: '1y',
});

describe('services/auth', () => {
  afterEach(() => {
    auth.reset();
    fetchMock.mockClear();
  });

  describe('#init', () => {
    it('should initialize and setup', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: validToken,
      });

      await expect(auth.init('https://help-api/api', '123')).resolves.toEqual(
        validToken,
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
        token: validToken,
      });
      await expect(auth.getToken()).resolves.toEqual(validToken);
    });

    it('should throw an error if get fails', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', 500);
      await expect(auth.getToken()).rejects.toThrow();
    });

    it('should return a saved value', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: validToken,
      });
      await auth.init();
      await expect(auth.getToken()).resolves.toEqual(validToken);
    });
  });

  describe('#verify', () => {
    it('should return true if token is valid', () => {
      expect(auth.verify(validToken)).toBeTruthy();
    });

    it('should return true if token is expired or invalid', () => {
      expect(auth.verify(null)).toBeFalsy();
      expect(auth.verify(expiredToken)).toBeFalsy();
    });
  });

  describe('#hoc', () => {
    it('should wrap a function and attach token', async () => {
      const spy = jest.fn();
      await auth.hoc(spy, '1', '2');
      expect(spy).toHaveBeenCalledWith('1', '2', validToken);
    });
  });

  describe('#middleware', () => {
    it('should attach a token value to req', async () => {
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: validToken,
      });
      const next = jest.fn();
      const req = {};
      await auth.init();
      auth.middleware()(req, {}, next);
      expect(req).toEqual({
        token: validToken,
      });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should request a new token if there is no longer one', async () => {
      fetchMock
        .post('https://help-api/api/public/authenticate', {
          token: 'abc',
        })
        .post('https://help-api/api/public/authenticate', {
          token: 'cde',
        });
      const next = jest.fn();
      const req = {};
      await auth.init();
      auth.reset();
      await auth.middleware()(req, {}, next);
      expect(req).toEqual({
        token: 'cde',
      });
      expect(fetchMock).toHaveNthFetched(2);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw an error in middleware', async () => {
      const next = jest.fn();
      await auth.init();
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: expiredToken,
      });

      await auth.init();
      auth.reset();
      fetchMock.post('https://help-api/api/public/authenticate', 500);
      await auth.middleware()({}, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
