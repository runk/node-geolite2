import { getConfig } from './config.js';

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

const pathAliases = {
  'GeoLite2-ASN': 'asn',
  'GeoLite2-City': 'city',
  'GeoLite2-Country': 'country',
};

const getSelectedDbs = () => {
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

export { defaultEditions, getSelectedDbs, pathAliases, validEditions };
