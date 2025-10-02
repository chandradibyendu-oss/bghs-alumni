// Test the password hash we're using
const bcrypt = require('bcrypt');

async function testHash() {
    const password = 'TestPass123!';
    const hash = '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6';
    
    console.log('Testing password hash...');
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test if the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
    
    // Generate a new hash to compare
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash:', newHash);
    
    // Test the new hash
    const newHashValid = await bcrypt.compare(password, newHash);
    console.log('New hash verification:', newHashValid);
    
    // Test different bcrypt variants
    console.log('\nTesting different bcrypt variants:');
    
    // Test $2a$ variant
    const hash2a = await bcrypt.hash(password, 10);
    console.log('$2a$ hash:', hash2a);
    console.log('$2a$ verification:', await bcrypt.compare(password, hash2a));
    
    // Test $2b$ variant (what we're using)
    console.log('$2b$ hash (our current):', hash);
    console.log('$2b$ verification:', await bcrypt.compare(password, hash));
}

testHash().catch(console.error);
