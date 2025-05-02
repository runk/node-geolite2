const assert = require('assert');
const fs = require('fs');
const geolite2 = require('../');

describe('geolite2', function () {
  // Check that the databases downloaded successfully.
  it('should return a valid city db path', function () {
    var stat = fs.statSync(geolite2.paths.city);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });

  it('should return a valid country db path', function () {
    var stat = fs.statSync(geolite2.paths.country);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });

  it('should return a valid ASN db path', function () {
    var stat = fs.statSync(geolite2.paths.asn);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });

  // Also check the new edition-ID-based keys. (These should be the same files
  // as above.)
  it('should return a valid city db path with the edition ID', function () {
    var stat = fs.statSync(geolite2.paths['geolite2-city']);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });

  it('should return a valid country db path with the edition ID', function () {
    var stat = fs.statSync(geolite2.paths['geolite2-country']);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });

  it('should return a valid ASN db path with the edition ID', function () {
    var stat = fs.statSync(geolite2.paths['geolite2-asn']);
    assert(stat.size > 1e6);
    assert(stat.ctime);
  });
});
