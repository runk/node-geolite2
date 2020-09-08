const path = require("path");

const {selectedDbs} = require('./utils');
const selected = selectedDbs();

const makePath = (type) => path.resolve(__dirname, `dbs/GeoLite2-${type}.mmdb`);

const paths = selected.reduce((a,c) => {
  a[c.toLowerCase()] = makePath(c);
  return a;
}, {});

module.exports = {
  paths
};
