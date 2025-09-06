// Test R2 Upload Script
require('dotenv').config({ path: '.env.local' });

async function testR2Upload() {
  console.log('🧪 Testing R2 Upload...\n');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bghs-gallery';

  if (!accountId || !accessKeyId || !secretKey) {
    console.error('❌ Missing R2 configuration');
    console.log('Run: node scripts/setup-r2-config.js for setup instructions');
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
    const folder = 'gallery';

    console.log(`📤 Uploading test image: ${fileName}`);
    console.log(`📁 Target folder: ${folder}`);
    console.log(`🪣 Bucket: ${bucketName}`);

    // Import the R2 storage module
    const { r2Storage } = require('../lib/r2-storage.ts');

    // Upload file
    const result = await r2Storage.uploadFile(
      testImageBuffer,
      fileName,
      'image/png',
      folder
    );
    
    console.log('✅ Upload successful!');
    console.log(`📄 Key: ${result.key}`);
    console.log(`🔗 URL: ${result.url}`);
    console.log(`📏 Size: ${result.size} bytes`);

    // Test thumbnail upload
    console.log('\n📤 Uploading test thumbnail...');
    const thumbnailFileName = `thumb_${fileName}`;
    
    const thumbnailResult = await r2Storage.uploadFile(
      testImageBuffer,
      thumbnailFileName,
      'image/png',
      'gallery/thumbnails'
    );
    
    console.log('✅ Thumbnail upload successful!');
    console.log(`📄 Thumbnail Key: ${thumbnailResult.key}`);
    console.log(`🔗 Thumbnail URL: ${thumbnailResult.url}`);

    console.log('\n🎉 R2 upload test completed successfully!');
    console.log('Your R2 integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Build and restart your server: npm run build && npm start');
    console.log('2. Test uploading a photo through the gallery interface');

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    
    if (error.message.includes('InvalidAccessKeyId')) {
      console.log('\n💡 Check your CLOUDFLARE_R2_ACCESS_KEY_ID');
    } else if (error.message.includes('SignatureDoesNotMatch')) {
      console.log('\n💡 Check your CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    } else if (error.message.includes('NoSuchBucket')) {
      console.log('\n💡 Check your bucket name and ensure it exists in R2');
    } else if (error.message.includes('AccessDenied')) {
      console.log('\n💡 Check your R2 API token permissions');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your R2 bucket exists');
    console.log('2. Check API token permissions (Object Read & Write)');
    console.log('3. Ensure Account ID is correct');
    console.log('4. Run: node scripts/setup-r2-config.js for setup help');
  }
}

testR2Upload().catch(console.error);
