import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  getAccountId,
  getLicense,
  resetConfigCache,
} from '../src/config.js';
import { getSelectedDbs } from '../src/databases.js';

describe('config', function () {
  it('should prefer env config without logging missing package config', () => {
    const originalAccountId = process.env.MAXMIND_ACCOUNT_ID;
    const originalLicenseKey = process.env.MAXMIND_LICENSE_KEY;
    const originalConsoleLog = console.log;
    const messages = [];

    process.env.MAXMIND_ACCOUNT_ID = 'account-id';
    process.env.MAXMIND_LICENSE_KEY = 'license-key';
    console.log = (...args) => messages.push(args.join(' '));
    resetConfigCache();

    try {
      assert.strictEqual(getAccountId(), 'account-id');
      assert.strictEqual(getLicense(), 'license-key');
      assert.deepStrictEqual(getSelectedDbs(), [
        'GeoLite2-ASN',
        'GeoLite2-City',
        'GeoLite2-Country',
      ]);
      assert.deepStrictEqual(messages, []);
    } finally {
      if (originalAccountId === undefined) {
        delete process.env.MAXMIND_ACCOUNT_ID;
      } else {
        process.env.MAXMIND_ACCOUNT_ID = originalAccountId;
      }

      if (originalLicenseKey === undefined) {
        delete process.env.MAXMIND_LICENSE_KEY;
      } else {
        process.env.MAXMIND_LICENSE_KEY = originalLicenseKey;
      }

      console.log = originalConsoleLog;
      resetConfigCache();
    }
  });

  it('should resolve license-file relative to the discovered package.json', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'geolite2-config-'));
    const nestedDir = path.join(fixtureRoot, 'nested', 'project');
    const licenseFile = 'maxmind-license.key';
    const originalInitCwd = process.env.INIT_CWD;
    const originalAccountId = process.env.MAXMIND_ACCOUNT_ID;
    const originalLicenseKey = process.env.MAXMIND_LICENSE_KEY;

    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(
      path.join(fixtureRoot, 'package.json'),
      JSON.stringify({
        geolite2: {
          'account-id': 'pkg-account-id',
          'license-file': licenseFile,
        },
      }),
    );
    fs.writeFileSync(
      path.join(fixtureRoot, licenseFile),
      'license-from-file\n',
    );

    delete process.env.MAXMIND_ACCOUNT_ID;
    delete process.env.MAXMIND_LICENSE_KEY;
    process.env.INIT_CWD = nestedDir;
    resetConfigCache();

    try {
      assert.strictEqual(getAccountId(), 'pkg-account-id');
      assert.strictEqual(getLicense(), 'license-from-file');
    } finally {
      if (originalInitCwd === undefined) {
        delete process.env.INIT_CWD;
      } else {
        process.env.INIT_CWD = originalInitCwd;
      }

      if (originalAccountId === undefined) {
        delete process.env.MAXMIND_ACCOUNT_ID;
      } else {
        process.env.MAXMIND_ACCOUNT_ID = originalAccountId;
      }

      if (originalLicenseKey === undefined) {
        delete process.env.MAXMIND_LICENSE_KEY;
      } else {
        process.env.MAXMIND_LICENSE_KEY = originalLicenseKey;
      }

      resetConfigCache();
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
