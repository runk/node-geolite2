const path = require('path');
const fs = require('fs');

const cwdPath = (file) => path.join(process.env['INIT_CWD'] || process.cwd(), file);

const getConfig = () => {
  const packageJsonFilename = cwdPath('package.json');
  const packageJson = require(packageJsonFilename);
  return packageJson['geolite2'] || {};
};

const getLicense = () => {
  const envKey = process.env.MAXMIND_LICENSE_KEY;
  if(envKey) return envKey;
  
  const config = getConfig();
  const licenseKey = config['license-key'];
  if(licenseKey) return licenseKey;

  const configFile = config['license-file'];
  if(!configFile) return;

  const configFilePath = cwdPath(configFile);
  return fs.existsSync(configFilePath) 
       ? fs.readFileSync(configFilePath, 'utf8').trim()
       : undefined;
}

const selectedDbs = () => {
  const config = getConfig();
  const selected = config['selected-dbs'];
  const valids = ['City', 'Country', 'ASN'];
  if(!selected) return valids;
  if(!Array.isArray(selected)) {
    console.error('selected-dbs property must have be an array.');
    process.exit(1);
  }

  if(selected.length === 0) return valids;

  if(selected.length > 3) {
    console.error('selected-dbs has too many values, there are only three valid values: City, Country, ASN.');
    process.exit(1);
  }

  for(const value of selected) {
    const index = valids.indexOf(value);
    if(index === -1) {
      console.error(`Invalid value in selected-dbs: ${value}. The only valid values are: City, Country, ASN.`);
      process.exit(1);
    }
  }

  return selected;
}

module.exports = {
  getConfig,
  getLicense,
  selectedDbs
}
