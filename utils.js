const path = require('path');
const fs = require('fs');

const getConfigWithDir = () => {
  const cwd = process.env['INIT_CWD'] || process.cwd();
  let dir = cwd;

  // Find a package.json with geolite2 configuration key at or above the level
  // of this directory.
  while (fs.existsSync(dir)) {
    const packageJSON = path.join(dir, 'package.json');
    if (fs.existsSync(packageJSON)) {
      const contents = require(packageJSON);
      const config = contents['geolite2'];
      if (config) return { config, dir };
    }

    const parentDir = path.resolve(dir, '..');
    if (parentDir === dir) break;
    dir = parentDir;
  }

  console.log(
    "INFO: geolite2 cannot find configuration in package.json file, using defaults.\n" +
    "INFO: geolite2 expects to have 'MAXMIND_ACCOUNT_ID' and 'MAXMIND_LICENSE_KEY' to be present in environment variables when package.json is unavailable.",
  );
  console.log(
    'INFO: geolite2 expected package.json to be present at a parent of:\n%s',
    cwd
  );
};

const getConfig = () => {
  const configWithDir = getConfigWithDir();
  if (!configWithDir) return;
  return configWithDir.config;
};

const getAccountId = () => {
  const envId = process.env.MAXMIND_ACCOUNT_ID;
  if (envId) return envId;

  const config = getConfig();
  if (!config) return;

  return config['account-id'];
}

const getLicense = () => {
  const envKey = process.env.MAXMIND_LICENSE_KEY;
  if (envKey) return envKey;

  const configWithDir = getConfigWithDir();
  if (!configWithDir) return;

  const { config, dir } = configWithDir;

  const licenseKey = config['license-key'];
  if (licenseKey) return licenseKey;

  const configFile = config['license-file'];
  if (!configFile) return;

  const configFilePath = path.join(dir, configFile);
  return fs.existsSync(configFilePath)
    ? fs.readFileSync(configFilePath, 'utf8').trim()
    : undefined;
};

const getSelectedDbs = () => {
  const aliases = ['ASN', 'City', 'Country'];
  const defaultEditions = ['GeoLite2-ASN', 'GeoLite2-City', 'GeoLite2-Country'];
  const validEditions = [
    'GeoIP-Anonymous-Plus',
    'GeoIP-Network-Optimization-City',
    'GeoIP2-Anonymous-IP',
    'GeoIP2-City',
    'GeoIP2-City-Africa',
    'GeoIP2-City-Asia-Pacific',
    'GeoIP2-City-Europe',
    'GeoIP2-City-North-America',
    'GeoIP2-City-Shield',
    'GeoIP2-City-South-America',
    'GeoIP2-Connection-Type',
    'GeoIP2-Country',
    'GeoIP2-Country-Shield',
    'GeoIP2-DensityIncome',
    'GeoIP2-Domain',
    'GeoIP2-Enterprise',
    'GeoIP2-Enterprise-Shield',
    'GeoIP2-IP-Risk',
    'GeoIP2-ISP',
    'GeoIP2-Precision-Enterprise',
    'GeoIP2-Precision-Enterprise-Shield',
    'GeoIP2-Static-IP-Score',
    'GeoIP2-User-Connection-Type',
    'GeoIP2-User-Count',
    'GeoLite2-ASN',
    'GeoLite2-City',
    'GeoLite2-Country',
  ];

  const config = getConfig();
  const selectedWithPossibleAliases =
    config != null && config['selected-dbs'] != null
      ? config['selected-dbs']
      : defaultEditions;

  if (!Array.isArray(selectedWithPossibleAliases)) {
    console.error('selected-dbs property must be an array.');
    process.exit(1);
  }

  if (selectedWithPossibleAliases.length === 0) return defaultEditions;

  const selectedEditions = selectedWithPossibleAliases.map((element) => {
    const index = aliases.indexOf(element);
    
    if (index > -1) {
      return `GeoLite2-${element}`;
    }
    
    return element;
  });

  const validValuesText = validEditions.join(', ');
  if (selectedEditions.length > validEditions.length) {
    console.error(
      'Property selected-dbs has too many values, there are only %d valid values: %s',
      validEditions.length,
      validValuesText,
    );
    process.exit(1);
  }

  for (const value of selectedEditions) {
    const index = validEditions.indexOf(value);
    if (index === -1) {
      console.error(
        'Invalid value in selected-dbs: %s The only valid values are: %s',
        value,
        validValuesText,
      );
      process.exit(1);
    }
  }

  return selectedEditions;
};

module.exports = {
  getConfig,
  getAccountId,
  getLicense,
  getSelectedDbs,
};
