import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getSelectedDbs, pathAliases } from './databases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const selected = getSelectedDbs();

const makePath = (edition) => path.resolve(__dirname, `../dbs/${edition}.mmdb`);

const paths = selected.reduce((a, c) => {
  // The keys are the database names.
  a[c] = makePath(c);
  // For backward compatibility, we also populate the 'city', 'asn', and
  // 'country' keys for GeoLite databases.
  if (c in pathAliases) {
    a[pathAliases[c]] = makePath(c);
  }
  return a;
}, {});

export { paths };

export default {
  paths,
};
