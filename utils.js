const path = require('path');
const fs = require('fs');

const cwdPath = (file) =>
  path.join(process.env['INIT_CWD'] || process.cwd(), file);

const getConfig = () => {
  const packageJsonFilename = cwdPath('package.json');

  try {
    const packageJson = require(packageJsonFilename);
    return packageJson['geolite2'] || {};
  } catch {
    console.log(
      "WARN: geolite2 cannot find project's package.json file, using default configuration.\n" +
        'WARN: geolite2 expects to have maxmind licence key to be present in `MAXMIND_LICENSE_KEY` env variable when package.json is unavailable.'
    );
    console.log(
      'WARN: geolite2 expected package.json to be preset at:\n%s',
      packageJsonFilename
    );
    return {};
  }
};

const getLicense = () => {
  const envKey = process.env.MAXMIND_LICENSE_KEY;
  if (envKey) return envKey;

  const config = getConfig();
  const licenseKey = config['license-key'];
  if (licenseKey) return licenseKey;

  const configFile = config['license-file'];
  if (!configFile) return;

  const configFilePath = cwdPath(configFile);
  return fs.existsSync(configFilePath)
    ? fs.readFileSync(configFilePath, 'utf8').trim()
    : undefined;
};

const getSelectedDbs = () => {
  const config = getConfig();
  const selected = config['selected-dbs'];
  const valids = ['City', 'Country', 'ASN'];
  if (!selected) return valids;
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
  getLicense,
  getSelectedDbs,
};
