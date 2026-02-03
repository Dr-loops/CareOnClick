const { execSync } = require('child_process');
const fs = require('fs');
try {
    const conn = execSync('npx neonctl connection-string --project-id empty-term-45875818').toString().trim();
    fs.writeFileSync('production_db.txt', conn);
    console.log('File written: production_db.txt');
} catch (e) {
    console.error(e);
}
