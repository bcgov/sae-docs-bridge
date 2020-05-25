const Cache = require('../cache');

describe('services/cache', () => {
  const cache = new Cache();

  afterEach(() => {
    cache.flush();
  });

  it('should cache a result', async () => {
    const spy = jest.fn().mockResolvedValue(5);
    const spy2 = jest.fn().mockResolvedValue(6);

    const value = await cache.get('key', async () => {
      const result = await spy();
      return result;
    });
    expect(value).toEqual(5);

    const value2 = await cache.get('key', async () => {
      const result = await spy2();
      return result;
    });
    expect(value2).toEqual(5);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
