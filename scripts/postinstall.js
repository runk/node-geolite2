const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const path = require('path');
const tar = require('tar');

const getConfig = () => {
  const packageJsonFilename = path.join(
    process.env['INIT_CWD'],
    'package.json'
  );
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFilename, 'utf8'));
  return packageJson['geolite2'] || {};
};

const keyLoaders = [
  () => process.env.MAXMIND_LICENSE_KEY,
  () => getConfig()['license-key'],
  () => {
    const configFile = getConfig()['license-file'];
    if (!configFile) return;

    const filepath = path.join(process.env['INIT_CWD'], configFile);
    return fs.existsSync(filepath)
      ? fs.readFileSync(filepath, 'utf8').trim()
      : undefined;
  },
];

let licenseKey;

try {
  let i = 0;
  while (i < keyLoaders.length) {
    licenseKey = keyLoaders[i++]();
    if (licenseKey) break;
  }
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

const links = [
  link('GeoLite2-City'),
  link('GeoLite2-Country'),
  link('GeoLite2-ASN'),
];

const downloadPath = path.join(__dirname, '..', 'dbs');

if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

const download = (url) =>
  new Promise((resolve) => {
    https.get(url, function (response) {
      resolve(response.pipe(zlib.createGunzip({})));
    });
  });

console.log('Downloading maxmind databases...');
links.forEach((url) =>
  download(url).then((result) =>
    result.pipe(tar.t()).on('entry', (entry) => {
      if (entry.path.endsWith('.mmdb')) {
        const dstFilename = path.join(downloadPath, path.basename(entry.path));
        entry.pipe(fs.createWriteStream(dstFilename));
      }
    })
  )
);
