import fs from 'node:fs';
import path from 'node:path';

let cachedConfigWithDir;

const findConfigWithDir = () => {
  const cwd = process.env.INIT_CWD || process.cwd();
  let dir = cwd;

  // Find a package.json with geolite2 configuration key at or above this directory.
  while (fs.existsSync(dir)) {
    const packageJSON = path.join(dir, 'package.json');
    if (fs.existsSync(packageJSON)) {
      const contents = JSON.parse(fs.readFileSync(packageJSON, 'utf8'));
      const config = contents.geolite2;
      if (config) return { config, dir };
    }

    const parentDir = path.resolve(dir, '..');
    if (parentDir === dir) break;
    dir = parentDir;
  }

  return;
};

const getConfigWithDir = () => {
  if (cachedConfigWithDir !== undefined) {
    return cachedConfigWithDir;
  }

  cachedConfigWithDir = findConfigWithDir();
  return cachedConfigWithDir;
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
};

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

const maskLicenseKey = (licenseKey) => {
  if (!licenseKey) return 'NOT SET';
  if (licenseKey.length <= 4) return '****';
  const visiblePart = licenseKey.slice(-4);
  return `****${visiblePart}`;
};

const resetConfigCache = () => {
  cachedConfigWithDir = undefined;
};

export {
  getConfig,
  getAccountId,
  getLicense,
  maskLicenseKey,
  resetConfigCache,
};
