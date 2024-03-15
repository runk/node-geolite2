const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const tar = require('tar');
const path = require('path');
const { getLicense, getSelectedDbs } = require('../utils');

let licenseKey;
try {
  licenseKey = getLicense();
} catch (e) {
  console.error('geolite2: Error retrieving Maxmind License Key');
  console.error(e.message);
}

if (!licenseKey) {
  console.error(`Error: License key is not configured.\n
  You need to signup for a _free_ Maxmind account to get a license key.
  Go to https://www.maxmind.com/en/geolite2/signup, obtain your key and
  put it in the MAXMIND_LICENSE_KEY environment variable.

  If you don not have access to env vars, put this config in your package.json
  file (at the root level) like this:

  "geolite2": {
    // specify the key
    "license-key": "<your license key>",
    // ... or specify the file where key is located:
    "license-file": "maxmind-licence.key"
  }
`);
  process.exit(1);
}

const link = (edition) =>
  `https://download.maxmind.com/geoip/databases/${edition}/download?suffix=tar.gz`;

const selected = getSelectedDbs();
const editionIds = ['City', 'Country', 'ASN']
  .filter((e) => selected.includes(e))
  .map((e) => `GeoLite2-${e}`);

const downloadPath = path.join(__dirname, '..', 'dbs');

if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

const download = (url) =>
  new Promise((resolve) => {
    https.get(url, (response) => {
      resolve(response.pipe(zlib.createGunzip({})));
    });
  });

// https://dev.maxmind.com/geoip/updating-databases?lang=en#checking-for-the-latest-release-date
const isOutdated = async (dbPath, url) => {
  if (!fs.existsSync(dbPath)) return true;

  const remoteLastModified = await new Promise((resolve, reject) => {
    https
      .request(url, { method: 'HEAD' }, (res) =>
        resolve(Date.parse(res.headers['last-modified']))
      )
      .on('error', (err) => reject(err))
      .end();
  });
  const localLastModified = fs.statSync(dbPath).mtimeMs;

  return localLastModified < remoteLastModified;
};

const main = async () => {
  console.log('Downloading maxmind databases...');
  for (const editionId of editionIds) {
    const dbPath = path.join(downloadPath, `${editionId}.mmdb`);
    const isOutdatedStatus = await isOutdated(dbPath, link(editionId));

    if (!isOutdatedStatus) {
      console.log(' > %s: Is up to date, skipping download', editionId);
      continue;
    }
    console.log(' > %s: Is either missing or outdated, downloading', editionId);

    const result = await download(link(editionId));
    result.pipe(tar.t()).on('entry', (entry) => {
      if (entry.path.endsWith('.mmdb')) {
        const dstFilename = path.join(downloadPath, path.basename(entry.path));
        entry.pipe(fs.createWriteStream(dstFilename));
        entry.on('end', () => {});
      }
    });
  }
};

main()
  .then(() => {
    // success
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
