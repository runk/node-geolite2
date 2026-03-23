import assert from 'node:assert';
import fs from 'node:fs';

import geolite2, { paths } from '../index.js';

describe('geolite2', function () {
  const keys = [
    'GeoLite2-ASN',
    'GeoLite2-City',
    'GeoLite2-Country',
    // Legacy aliases:
    'city',
    'country',
    'asn',
  ];

  keys.forEach((key) =>
    it(`should return a database path for ${key}`, () => {
      const stat = fs.statSync(geolite2.paths[key]);
      assert(stat.size > 1e6);
      assert(stat.ctime);
    }),
  );

  it('should expose paths as a named export', () => {
    assert.strictEqual(paths, geolite2.paths);
  });
});
