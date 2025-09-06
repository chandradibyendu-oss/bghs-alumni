// Test OneDrive Upload Script
require('dotenv').config({ path: '.env.local' });

async function testOneDriveUpload() {
  console.log('🧪 Testing OneDrive Upload...\n');

  const accessToken = process.env.ONEDRIVE_ACCESS_TOKEN;
  const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN;

  if (!accessToken && !refreshToken) {
    console.error('❌ No OneDrive authentication tokens found');
    console.log('Run: node scripts/setup-onedrive-auth.js first');
    return;
  }

  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const fileName = `test-${Date.now()}.png`;
    const folderPath = 'alumnibghs/BGHSGallery';

    console.log(`📤 Uploading test image: ${fileName}`);
    console.log(`📁 Target folder: ${folderPath}`);

    // Create folder structure first
    await ensureFolderExists('alumnibghs', accessToken);
    await ensureFolderExists('alumnibghs/BGHSGallery', accessToken);

    // Upload file
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}/${fileName}:/content`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/png',
      },
      body: testImageBuffer,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const result = await response.json();
    
    console.log('✅ Upload successful!');
    console.log(`📄 File ID: ${result.id}`);
    console.log(`🔗 Web URL: ${result.webUrl}`);
    console.log(`📏 Size: ${result.size} bytes`);

    // Get download URL
    const downloadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${result.id}/content?access_token=${accessToken}`;
    console.log(`⬇️  Download URL: ${downloadUrl}`);

    console.log('\n🎉 OneDrive upload test completed successfully!');
    console.log('Your OneDrive integration is working correctly.');

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Your access token may have expired.');
      console.log('Run: node scripts/setup-onedrive-auth.js to get fresh tokens');
    }
  }
}

async function ensureFolderExists(folderPath, accessToken) {
  try {
    // Try to get the folder
    const folderUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}`;
    const response = await fetch(folderUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return; // Folder exists
    }
  } catch (error) {
    // Folder doesn't exist, create it
  }

  // Create folder
  const createFolderUrl = `https://graph.microsoft.com/v1.0/me/drive/root/children`;
  const folderResponse = await fetch(createFolderUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderPath,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    }),
  });

  if (!folderResponse.ok) {
    const error = await folderResponse.text();
    throw new Error(`Failed to create folder: ${error}`);
  }
}

testOneDriveUpload().catch(console.error);
