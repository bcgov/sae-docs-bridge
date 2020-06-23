const { compare } = require('../helpers');

const newer = {
  revised: '2020-05-29T18:05:42Z',
};
const older = {
  revised: '2020-05-19T18:05:42Z',
};

describe('utils/helpers', () => {
  describe('#compare', () => {
    it('should return false if there are no cached values', () => {
      expect(compare(older, [])).toBeTruthy();
    });

    it('should return true if cached value is older', () => {
      expect(compare(newer, [{ meta: older }, { meta: older }])).toBeTruthy();
    });

    it('should return false if cached value is newest', () => {
      expect(compare(older, [{ meta: older }, { meta: older }])).toBeFalsy();
    });
  });
});
