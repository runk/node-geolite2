const assert = require('assert');
const fs = require('fs');
const geolite2 = require('../');

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
      var stat = fs.statSync(geolite2.paths[key]);
      assert(stat.size > 1e6);
      assert(stat.ctime);
    }),
  );
});
