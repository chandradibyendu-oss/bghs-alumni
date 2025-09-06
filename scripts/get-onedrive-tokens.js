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
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
};

(async () => {
  const pca = new PublicClientApplication(config);
  
  const deviceCodeRequest = {
    deviceCodeCallback: (response) => {
      console.log('\n=== OneDrive Authentication Required ===');
      console.log('Please visit: ' + response.verificationUri);
      console.log('Enter code: ' + response.userCode);
      console.log('This will generate the required tokens for OneDrive uploads.\n');
    },
    scopes: [
      'https://graph.microsoft.com/Files.ReadWrite', 
      'https://graph.microsoft.com/User.Read',
      'offline_access'
    ],
  };

  try {
    const result = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
    const accessToken = result.accessToken;
    const refreshToken = result.refreshToken;

    console.log('\n=== SUCCESS! Add these to your .env.local file ===');
    console.log(`ONEDRIVE_ACCESS_TOKEN=${accessToken}`);
    console.log(`ONEDRIVE_REFRESH_TOKEN=${refreshToken}`);
    console.log('\nAfter adding these, restart your server and try uploading again.\n');

    // Test the token by listing OneDrive root
    const res = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const json = await res.json();
      console.log('✅ Token test successful! OneDrive access confirmed.');
      console.log(`Found ${json.value.length} items in OneDrive root.`);
    } else {
      console.log('❌ Token test failed. Please try again.');
    }

  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }
})();
