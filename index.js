const path = require('path');

const { getSelectedDbs } = require('./utils');
const selected = getSelectedDbs();

const makePath = (type) => path.resolve(__dirname, `dbs/GeoLite2-${type}.mmdb`);

const paths = selected.reduce((a, c) => {
  a[c.toLowerCase()] = makePath(c);
  return a;
}, {});

module.exports = {
  paths,
};
