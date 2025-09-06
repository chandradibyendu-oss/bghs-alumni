// Test script to check if we can insert into gallery_photos
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGalleryInsert() {
  try {
    // Test if we can insert a dummy photo
    const { data, error } = await supabase
      .from('gallery_photos')
      .insert({
        title: 'Test Photo',
        description: 'Test upload',
        category_id: '1', // Assuming category 1 exists
        uploaded_by: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        file_url: '/test.jpg',
        thumbnail_url: '/test_thumb.jpg',
        file_size: 1024,
        width: 800,
        height: 600,
        is_approved: false
      })
      .select();

    if (error) {
      console.error('❌ Insert failed:', error);
    } else {
      console.log('✅ Insert successful:', data);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testGalleryInsert();
