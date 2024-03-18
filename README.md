# node-geolite2

Maxmind's GeoLite2 Free Databases download helper.

## Configuration

### Access Key

**IMPORTANT** You must set up `MAXMIND_ACCOUNT_ID` and `MAXMIND_LICENSE_KEY` environment variables to be able to download databases. To do so, go to the https://www.maxmind.com/en/geolite2/signup, create a free account and generate new license key.

If you don't have access to the environment variables during installation, you can provide config via `package.json`:

```jsonc
{
  ...
  "geolite2": {
    // specify the account id
    "account-id": "<your account id>",
    // specify the key
    "license-key": "<your license key>",
    // ... or specify the file where key is located:
    "license-file": "maxmind-license.key"
  }
  ...
}
```

Beware of security risks of adding keys and secrets to your repository!

**Note:** For backwards compatibility, the account ID is currently optional. When not provided we fall back to using legacy Maxmind download URLs with only the license key. However, this behavior may become unsupported in the future so adding an account ID is recommended. 

### Selecting databases to download

You can select the dbs you want downloaded by adding a `selected-dbs` property on `geolite2` via `package.json`.

`selected-dbs` must be an array of strings, one or more of the values `City`, `Country`, `ASN`.

If `selected-dbs` is unset, or is set but empty, all dbs will be downloaded.

```jsonc
{
  ...
  "geolite2": {
    "selected-dbs": ["City", "Country", "ASN"]
  }
  ...
}
```

## Usage

```javascript
var geolite2 = require('geolite2');
var maxmind = require('maxmind');

var lookup = maxmind.openSync(geolite2.paths.city); // or geolite2.paths.country or geolite2.paths.asn
var city = lookup.get('66.6.44.4');
```

## Alternatives

[geolite2-redist](https://github.com/GitSquared/node-geolite2-redist) provides redistribution which does not require personal license key. Make sure you understand legal terms and what they mean for your use-case.

## License

Creative Commons Attribution-ShareAlike 4.0 International License
