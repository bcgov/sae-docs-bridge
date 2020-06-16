const cache = require('../cache');

describe('services/cache', () => {
  afterEach(() => {
    cache.flush();
  });

  it('should cache a single value', () => {
    cache.set('val1', 1);
    expect(cache.get('val1')).toEqual(1);
  });

  it('should cache an array', () => {
    const value = [
      { key: '1', val: 1 },
      { key: '2', val: 2 },
    ];
    cache.set(value);
    expect(cache.get('1')).toEqual(value[0].val);
    expect(cache.get('2')).toEqual(value[1].val);
  });

  describe('cache#middleware', () => {
    const req = {
      params: {
        app: 'ocwa',
        keyword: 'documentation',
      },
      query: {
        role: 'exporter',
      },
    };

    it('should return a cached value via middleware', () => {
      const value = { id: 1 };
      const json = jest.fn().mockReturnValue(value);
      const res = {
        json,
      };
      cache.set('#ocwa#documentation#exporter#', value);
      cache.middleware(req, res);
      expect(json).toHaveReturnedWith(value);
    });

    it('should pass thru if no cache value exists', () => {
      const json = jest.fn();
      const next = jest.fn();
      const res = {
        json,
      };
      cache.middleware(req, res, next);
      expect(json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should throw an error', () => {
      const next = jest.fn();
      const res = {};

      cache.middleware({}, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
