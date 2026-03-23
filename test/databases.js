import assert from 'node:assert';

import { resetConfigCache } from '../src/config.js';
import {
  defaultEditions,
  getSelectedDbs,
  pathAliases,
} from '../src/databases.js';

describe('databases', function () {
  it('should expose default editions and path aliases', () => {
    assert.deepStrictEqual(defaultEditions, [
      'GeoLite2-ASN',
      'GeoLite2-City',
      'GeoLite2-Country',
    ]);
    assert.deepStrictEqual(pathAliases, {
      'GeoLite2-ASN': 'asn',
      'GeoLite2-City': 'city',
      'GeoLite2-Country': 'country',
    });
  });

  it('should fall back to default editions without config', () => {
    const originalInitCwd = process.env.INIT_CWD;

    delete process.env.INIT_CWD;
    resetConfigCache();

    try {
      assert.deepStrictEqual(getSelectedDbs(), defaultEditions);
    } finally {
      if (originalInitCwd === undefined) {
        delete process.env.INIT_CWD;
      } else {
        process.env.INIT_CWD = originalInitCwd;
      }
      resetConfigCache();
    }
  });
});
