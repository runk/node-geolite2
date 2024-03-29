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
  const valids = ['City', 'Country', 'ASN'];

  const config = getConfig();
  const selected =
    config != null && config['selected-dbs'] != null
      ? config['selected-dbs']
      : valids;

  if (!Array.isArray(selected)) {
    console.error('selected-dbs property must have be an array.');
    process.exit(1);
  }

  if (selected.length === 0) return valids;

  const validValuesText = valids.join(', ');
  if (selected.length > valids.length) {
    console.error(
      'Property selected-dbs has too many values, there are only %d valid values: %s',
      valids.length,
      validValuesText
    );
    process.exit(1);
  }

  for (const value of selected) {
    const index = valids.indexOf(value);
    if (index === -1) {
      console.error(
        'Invalid value in selected-dbs: %s The only valid values are: %s',
        value,
        validValuesText
      );
      process.exit(1);
    }
  }

  return selected;
};

module.exports = {
  getConfig,
  getAccountId,
  getLicense,
  getSelectedDbs,
};
