jest.mock('../cache');
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('node-fetch');

const { getDocument, prefetch, search } = require('../help-provider');
const cache = require('../cache');

fetchMock.config.overwriteRoutes = true;

const result = [
  {
    id: 'container-1',
    page: {},
  },
];
const results = [
  {
    id: '111a',
    itemType: 'tag',
    documentId: '111b',
    documentSlug: 'sae-onboarding',
    document: 'SAE Onboarding',
    tags: '#bbsae#onboarding#',
    revised: '2020-05-29T18:05:42Z',
  },
];
fetchMock
  .get('https://help-api/api/fetch/page/111b', result)
  .post('https://help-api/api/search', results);

describe('services/help-provider', () => {
  afterEach(() => {
    fetchMock.mockClear();
  });

  describe('#search', () => {
    it('should search', async () => {
      await expect(search('123', ['app1', 'app2'])).resolves.toEqual(results);
      expect(fetchMock).toHaveLastFetched(
        'https://help-api/api/search',
        'post',
      );
      expect(fetchMock.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer 123',
            'Cache-Control': 'no-cache',
          },
          // prettier-ignore
          body:
            '{"keywords":"\\\"app1\\\" \\\"app2\\\"","content":false,"doc":false,"tag":true,"attachment":false}'
        }),
      );
    });

    it('should throw on search failure', async () => {
      fetchMock.post('https://help-api/api/search', 500);

      try {
        await search('123', null);
      } catch (e) {
        expect(e).not.toBeFalsy();
      }
    });
  });

  describe('#getDocument', () => {
    it('should return a document', async () => {
      await expect(getDocument('123', '111b')).resolves.toEqual(result);
      expect(fetchMock).toHaveLastFetched(
        'https://help-api/api/fetch/page/111b',
        'get',
      );
    });

    it('should throw on search failure', async () => {
      fetchMock.get('https://help-api/api/fetch/page/123123', 500);

      try {
        await getDocument('123', null);
      } catch (e) {
        expect(e).not.toBeFalsy();
      }
    });
  });

  describe('#prefetch', () => {
    it('should filter the relevant apps', async () => {
      const document = {
        id: '111b',
      };
      fetchMock.post('https://help-api/api/public/authenticate', {
        token: '123',
      });
      fetchMock.post('https://help-api/api/search', [
        {
          id: '111a',
          itemType: 'tag',
          documentId: '111b',
          documentSlug: 'sae-onboarding',
          document: 'SAE Onboarding',
          tags: '#ocwa#onboarding#',
          revised: '2020-05-29T18:05:42Z',
        },
      ]);
      fetchMock.get('https://help-api/api/fetch/page/111b', document);

      await prefetch(['ocwa'], cache, '123');
      expect(fetchMock).toHaveLastFetched(
        'https://help-api/api/fetch/page/111b',
        'get',
      );
      expect(cache.set).toHaveBeenCalledWith('#ocwa#onboarding#', document);
    });

    it('should throw an error', async () => {
      try {
        await prefetch();
      } catch (e) {
        expect(e).not.toBeFalsy();
      }
    });

    it('should not fetch an up to date document', async () => {
      const savedCache = {
        get() {
          return [
            {
              meta: {
                revised: '2020-05-29T18:05:42Z',
              },
            },
          ];
        },
      };
      fetchMock.post('https://help-api/api/search', [
        {
          id: '111a',
          itemType: 'tag',
          documentId: '111b',
          documentSlug: 'sae-onboarding',
          document: 'SAE Onboarding',
          tags: '#ocwa#onboarding#',
          revised: '2020-05-29T18:05:42Z',
        },
      ]);
      await prefetch(['ocwa'], savedCache, '123');
      expect(fetchMock).not.toHaveLastFetched(
        'https://help-api/api/fetch/page/111b',
        'get',
      );
    });

    it('should fetch an out of date document', async () => {
      const spy = jest.fn();
      const savedCache = {
        get() {
          return [
            {
              meta: {
                revised: '2020-04-29T18:05:42Z',
              },
            },
          ];
        },
        set: spy,
      };
      fetchMock.post('https://help-api/api/search', [
        {
          id: '111a',
          itemType: 'tag',
          documentId: '111b',
          documentSlug: 'sae-onboarding',
          document: 'SAE Onboarding',
          tags: '#ocwa#onboarding#',
          revised: '2020-05-29T18:05:42Z',
        },
      ]);
      await prefetch(['ocwa'], savedCache, '123');
      expect(spy).toHaveBeenCalled();
      expect(fetchMock).toHaveLastFetched(
        'https://help-api/api/fetch/page/111b',
        'get',
      );
    });
  });
});
