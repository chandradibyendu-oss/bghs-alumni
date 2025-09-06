const { PublicClientApplication, LogLevel } = require('@azure/msal-node');

const clientId = process.env.MICROSOFT_CLIENT_ID || 'a9baf6e8-4c2e-4bcf-9113-4253efb91322';
const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

const config = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
};

// Use global fetch if available (Node 18+), otherwise fall back to node-fetch dynamic import
async function fetchSafe(url, options) {
  if (typeof fetch === 'function') {
    return fetch(url, options);
  }
  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch(url, options);
}

(async () => {
  const pca = new PublicClientApplication(config);
  const deviceCodeRequest = {
    deviceCodeCallback: (response) => {
      console.log('DEVICE CODE MESSAGE:\n');
      console.log(response.message);
      console.log('');
    },
    scopes: ['https://graph.microsoft.com/Files.Read', 'https://graph.microsoft.com/User.Read'],
  };

  try {
    const result = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
    const accessToken = result.accessToken;

    const res = await fetchSafe('https://graph.microsoft.com/v1.0/me/drive/root/children', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Graph error ${res.status}: ${text}`);
    }

    const json = await res.json();
    console.log('OneDrive root items:');
    for (const item of json.value) {
      console.log(`- ${item.name} (${item.folder ? 'folder' : 'file'})`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
