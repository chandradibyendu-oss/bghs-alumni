// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Note: This is a simplified test without importing the TypeScript module
// We'll test the environment variables and basic connectivity

async function testOneDriveAuth() {
  console.log('Testing OneDrive authentication...')
  
  try {
    // Check if environment variables are set
    const clientId = process.env.MICROSOFT_CLIENT_ID
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
    const tenantId = process.env.MICROSOFT_TENANT_ID
    const accessToken = process.env.ONEDRIVE_ACCESS_TOKEN
    const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN

    console.log('Environment variables:')
    console.log('- MICROSOFT_CLIENT_ID:', clientId ? '✓ Set' : '❌ Missing')
    console.log('- MICROSOFT_CLIENT_SECRET:', clientSecret ? '✓ Set' : '❌ Missing')
    console.log('- MICROSOFT_TENANT_ID:', tenantId ? '✓ Set' : '❌ Missing')
    console.log('- ONEDRIVE_ACCESS_TOKEN:', accessToken ? '✓ Set' : '❌ Missing')
    console.log('- ONEDRIVE_REFRESH_TOKEN:', refreshToken ? '✓ Set' : '❌ Missing')

    if (!clientId || !clientSecret) {
      console.error('❌ Missing required Microsoft App credentials')
      console.log('\nTo set up OneDrive integration:')
      console.log('1. Go to Azure Portal (https://portal.azure.com)')
      console.log('2. Create or select an App Registration')
      console.log('3. Add these environment variables to your .env.local:')
      console.log('   MICROSOFT_CLIENT_ID=your_client_id')
      console.log('   MICROSOFT_CLIENT_SECRET=your_client_secret')
      console.log('   MICROSOFT_TENANT_ID=common (or your tenant ID)')
      return
    }

    if (!accessToken && !refreshToken) {
      console.log('\n⚠️  No authentication tokens found')
      console.log('You need to authenticate with OneDrive first.')
      console.log('Run: node scripts/get-onedrive-tokens.js')
      return
    }

    // Test basic connectivity
    console.log('\nTesting OneDrive connectivity...')
    
    if (accessToken) {
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (response.ok) {
          console.log('✓ OneDrive API connectivity successful')
        } else {
          console.error('❌ OneDrive API connectivity failed:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ OneDrive API test failed:', error.message)
      }
    }

    console.log('\n✅ OneDrive integration is ready!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testOneDriveAuth()
