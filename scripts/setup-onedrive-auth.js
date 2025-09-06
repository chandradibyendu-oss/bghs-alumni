// OneDrive OAuth Setup Script
// This script helps you get the required authentication tokens

const readline = require('readline');
const https = require('https');
const { URL } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupOneDriveAuth() {
  console.log('🚀 OneDrive Authentication Setup');
  console.log('================================\n');

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

  if (!clientId) {
    console.error('❌ MICROSOFT_CLIENT_ID not found in environment variables');
    console.log('Please add MICROSOFT_CLIENT_ID to your .env.local file');
    rl.close();
    return;
  }

  console.log('📋 Current Configuration:');
  console.log(`- Client ID: ${clientId}`);
  console.log(`- Tenant ID: ${tenantId}\n`);

  console.log('🔧 Setup Instructions:');
  console.log('1. Go to Azure Portal: https://portal.azure.com');
  console.log('2. Navigate to "Azure Active Directory" > "App registrations"');
  console.log('3. Find your app registration or create a new one');
  console.log('4. Go to "Certificates & secrets" and create a new client secret');
  console.log('5. Copy the client secret value\n');

  const clientSecret = await askQuestion('Enter your Microsoft Client Secret: ');
  
  if (!clientSecret) {
    console.error('❌ Client secret is required');
    rl.close();
    return;
  }

  const redirectUri = process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:3001/api/auth/onedrive/callback';

  // Generate authorization URL
  const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'https://graph.microsoft.com/Files.ReadWrite offline_access');
  authUrl.searchParams.set('response_mode', 'query');

  console.log('\n🌐 Authorization Steps:');
  console.log('1. Open this URL in your browser:');
  console.log(`   ${authUrl.toString()}`);
  console.log('\n2. Sign in with your Microsoft account');
  console.log('3. Grant permissions to the application');
  console.log('4. Copy the "code" parameter from the redirect URL\n');

  const authCode = await askQuestion('Enter the authorization code from the redirect URL: ');

  if (!authCode) {
    console.error('❌ Authorization code is required');
    rl.close();
    return;
  }

  // Exchange code for tokens
  console.log('\n🔄 Exchanging authorization code for tokens...');

  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Files.ReadWrite offline_access'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    console.log('✅ Authentication successful!');
    console.log('\n📝 Add these to your .env.local file:');
    console.log('=====================================');
    console.log(`MICROSOFT_CLIENT_SECRET=${clientSecret}`);
    console.log(`ONEDRIVE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`ONEDRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n💡 The access token will expire in 1 hour, but the refresh token can be used to get new access tokens automatically.');

    // Test the tokens
    console.log('\n🧪 Testing OneDrive access...');
    
    const testResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/root', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (testResponse.ok) {
      console.log('✅ OneDrive API access confirmed!');
      console.log('\n🎉 Setup complete! You can now upload images to OneDrive.');
    } else {
      console.error('❌ OneDrive API test failed:', testResponse.status, testResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }

  rl.close();
}

setupOneDriveAuth().catch(console.error);
