// Test R2 URL generation
require('dotenv').config({ path: '.env.local' });

function testR2Urls() {
  console.log('🧪 Testing R2 URL Generation...\n');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bghs-gallery';

  console.log('Configuration:');
  console.log(`- Account ID: ${accountId}`);
  console.log(`- Custom Domain: ${customDomain || 'Not set'}`);
  console.log(`- Bucket Name: ${bucketName}\n`);

  const testKey = 'gallery/test-image.jpg';

  // Test URL generation
  let publicUrl;
  if (customDomain) {
    publicUrl = `https://${customDomain}/${testKey}`;
  } else {
    publicUrl = `https://pub-${accountId}.r2.dev/${testKey}`;
  }

  console.log('Generated URLs:');
  console.log(`- Key: ${testKey}`);
  console.log(`- Public URL: ${publicUrl}\n`);

  console.log('🔍 Test URLs in browser:');
  console.log('1. Try opening the public URL above');
  console.log('2. If it works, the issue is in the upload process');
  console.log('3. If it fails, check your R2 bucket public access settings\n');

  console.log('📝 R2 Bucket Public Access Setup:');
  console.log('1. Go to Cloudflare Dashboard → R2 → Your bucket');
  console.log('2. Go to "Settings" → "Public access"');
  console.log('3. Enable "Allow Access"');
  console.log('4. Add a custom domain or use the pub-*.r2.dev URL');
}

testR2Urls();
