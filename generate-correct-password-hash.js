// Generate correct bcrypt hash for TestPass123!
const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'TestPass123!';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
}

generateHash().catch(console.error);
