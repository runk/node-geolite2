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
  `https://download.maxmind.com/app/geoip_download?edition_id=${edition}&license_key=${licenseKey}&suffix=tar.gz`;

const selected = getSelectedDbs();
const editionIds = ['City', 'Country', 'ASN']
  .filter((e) => selected.includes(e))
  .map((e) => `GeoLite2-${e}`);

const downloadPath = path.join(__dirname, '..', 'dbs');

if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

const download = (url) =>
  new Promise((resolve) => {
    https.get(url, function (response) {
      resolve(response.pipe(zlib.createGunzip({})));
    });
  });

// https://dev.maxmind.com/geoip/updating-databases?lang=en#checking-for-the-latest-release-date
const getLastModified = (url) =>
  new Promise((resolve, reject) => {
    https.request(url, { method: 'HEAD'}, (res) => {
      resolve(res.headers['last-modified'])
    }).on('error', err => {
      reject(err);
    }).end();
  });

console.log('Downloading maxmind databases...');
editionIds.forEach((editionId) => {
  getLastModified(link(editionId)).then((lastModified) => {
    const dbPath = path.join(downloadPath, `${editionId}.mmdb`);
    const lastModifiedPath = path.join(downloadPath, `${editionId}.lastmodified`);
    if (fs.existsSync(dbPath) && fs.existsSync(lastModifiedPath)) {
      const lastDownloaded = fs.readFileSync(lastModifiedPath, {encoding: 'utf-8'})

      if (lastModified.length > 0 && lastDownloaded === lastModified) {
        console.log(`Found existing ${editionId}.mmdb, skipping download.`);
        return;
      }
    }
    download(link(editionId)).then((result) =>
      result.pipe(tar.t()).on('entry', (entry) => {
        if (entry.path.endsWith('.mmdb')) {
          const dstFilename = path.join(downloadPath, path.basename(entry.path));
          entry.pipe(fs.createWriteStream(dstFilename));
          entry.on('end', () => {
            fs.writeFileSync(lastModifiedPath, lastModified, {encoding: 'utf-8'})
          });
        }
      })
    );
  })
});
