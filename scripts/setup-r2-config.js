// Cloudflare R2 Configuration Setup Script
require('dotenv').config({ path: '.env.local' });

function setupR2Config() {
  console.log('🚀 Cloudflare R2 Storage Setup');
  console.log('==============================\n');

  console.log('📋 Required Environment Variables:');
  console.log('Add these to your .env.local file:\n');

  console.log('# Cloudflare R2 Storage Configuration');
  console.log('CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id');
  console.log('CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id');
  console.log('CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key');
  console.log('CLOUDFLARE_R2_BUCKET_NAME=bghs-gallery');
  console.log('CLOUDFLARE_R2_CUSTOM_DOMAIN=your_custom_domain.com  # Optional\n');

  console.log('🔧 Setup Steps:');
  console.log('1. Go to Cloudflare Dashboard: https://dash.cloudflare.com');
  console.log('2. Navigate to R2 Object Storage');
  console.log('3. Create a bucket named "bghs-gallery" (or use your preferred name)');
  console.log('4. Go to "Manage R2 API tokens"');
  console.log('5. Create a new API token with:');
  console.log('   - Permissions: Object Read & Write');
  console.log('   - Bucket: bghs-gallery');
  console.log('6. Copy the Access Key ID and Secret Access Key');
  console.log('7. Your Account ID is shown in the right sidebar of the dashboard\n');

  console.log('🌐 Custom Domain (Optional):');
  console.log('1. In your R2 bucket settings, go to "Custom Domains"');
  console.log('2. Add a custom domain (e.g., gallery.yourdomain.com)');
  console.log('3. Follow Cloudflare\'s DNS setup instructions');
  console.log('4. Add the custom domain to CLOUDFLARE_R2_CUSTOM_DOMAIN\n');

  console.log('✅ Benefits of R2 Storage:');
  console.log('- 10GB free storage per month');
  console.log('- Global CDN with fast image delivery');
  console.log('- No egress fees (unlike AWS S3)');
  console.log('- Simple setup and management');
  console.log('- Direct public URLs for images\n');

  console.log('🧪 After setup, test with:');
  console.log('node scripts/test-r2-upload.js\n');

  // Check current configuration
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  console.log('📊 Current Configuration Status:');
  console.log(`- Account ID: ${accountId ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Access Key ID: ${accessKeyId ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Secret Key: ${secretKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Bucket Name: ${bucketName || 'bghs-gallery (default)'}`);

  if (accountId && accessKeyId && secretKey) {
    console.log('\n🎉 R2 configuration appears complete!');
    console.log('You can now test the upload functionality.');
  } else {
    console.log('\n⚠️  Please complete the R2 setup steps above.');
  }
}

setupR2Config();
