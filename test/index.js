const assert = require('assert');
const fs = require('fs');
const geolite2 = require('../');

const {selectedDbs} = require('../utils');
const selected = selectedDbs();

describe('geolite2', function() {
  if(selected.includes('City')) {
    it('should return a valid city db path', function () {
      var stat = fs.statSync(geolite2.paths.city);
      assert(stat.size > 1e6);
      assert(stat.ctime);
    });
  }

  if(selected.includes('Country')) {
    it('should return a valid country db path', function () {
      var stat = fs.statSync(geolite2.paths.country);
      assert(stat.size > 1e6);
      assert(stat.ctime);
    });
  }

  if(selected.includes('ASN')) {
    it('should return a valid ASN db path', function () {
      var stat = fs.statSync(geolite2.paths.asn);
      assert(stat.size > 1e6);
      assert(stat.ctime);
    });
  }
});
