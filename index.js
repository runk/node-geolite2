const path = require('path');

const { getSelectedDbs } = require('./utils');
const selected = getSelectedDbs();

const makePath = (edition) => path.resolve(__dirname, `dbs/${edition}.mmdb`);

const paths = selected.reduce((a, c) => {
  const aliases = {
    'GeoLite2-ASN': 'asn',
    'GeoLite2-City': 'city',
    'GeoLite2-Country': 'country',
  };
  // The keys are the database names.
  a[c] = makePath(c);
  // For backward compatibility, we also populate the 'city', 'asn', and
  // 'country' keys for GeoLite databases.
  if (c in aliases) {
    a[aliases[c]] = makePath(c);
  }
  return a;
}, {});

module.exports = {
  paths,
};
