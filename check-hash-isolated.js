const bcrypt = require('bcryptjs');
const hash = '$2b$10$y1TefadERpQRWv4fmnKbguXe.qMHWUv8jtSevrFicEnH2xpvDZWw6';
const password = 'password';

async function check() {
    const match = await bcrypt.compare(password, hash);
    console.log(`Match result for "password": ${match}`);

    // Try some common variants
    const match1 = await bcrypt.compare('Password', hash);
    console.log(`Match result for "Password": ${match1}`);

    const match2 = await bcrypt.compare('123456', hash);
    console.log(`Match result for "123456": ${match2}`);
}

check();
