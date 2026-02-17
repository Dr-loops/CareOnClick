const bcrypt = require('bcryptjs');

const hash = '$2y$10$f6B0N/7vA73.i3Y6cQ7Oce.89q6G8H7Z6O8G8H7Z6O8G8H7Z6O8G'; // Mock hash
const pass = 'admin123';

async function test() {
    console.log("Testing bcryptjs...");
    const match = await bcrypt.compare(pass, hash);
    console.log("Match:", match);
}

test();
