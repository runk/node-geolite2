const path = require('path');

const { getSelectedDbs } = require('./utils');
const selected = getSelectedDbs();

const makePath = (edition) => path.resolve(__dirname, `dbs/${edition}.mmdb`);

const paths = selected.reduce((a, c) => {
  const aliases = {
    'geolite2-asn': 'asn',
    'geolite2-city': 'city',
    'geolite2-country': 'country',
  }
  // The keys are lower-case edition IDs
  key = c.toLowerCase()
  a[key] = makePath(c);
  // For backward compatibility, we also populate the 'city', 'asn', and
  // 'country' keys for GeoLite databases.
  if (key in aliases) {
    a[aliases[key]] = makePath(c);
  }
  return a;
}, {});

module.exports = {
  paths,
};
