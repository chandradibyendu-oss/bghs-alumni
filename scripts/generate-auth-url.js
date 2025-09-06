// Simple script to generate OneDrive authorization URL
require('dotenv').config({ path: '.env.local' });

const { URL } = require('url');

const clientId = process.env.MICROSOFT_CLIENT_ID;
const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
const redirectUri = process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:3001/api/auth/onedrive/callback';

console.log('Configuration:');
console.log('- Client ID:', clientId);
console.log('- Tenant ID:', tenantId);
console.log('- Redirect URI:', redirectUri);
console.log('');

if (!clientId) {
  console.error('❌ MICROSOFT_CLIENT_ID not found');
  process.exit(1);
}

// Generate authorization URL
const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('scope', 'https://graph.microsoft.com/Files.ReadWrite offline_access');
authUrl.searchParams.set('response_mode', 'query');

console.log('Generated Authorization URL:');
console.log(authUrl.toString());
console.log('');
console.log('URL Parameters:');
for (const [key, value] of authUrl.searchParams) {
  console.log(`- ${key}: ${value}`);
}
