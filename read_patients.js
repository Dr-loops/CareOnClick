
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'patients_list.txt');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    console.log("--- START FILE CONTENT ---");
    console.log(data);
    console.log("--- END FILE CONTENT ---");
} catch (err) {
    console.error("Error reading file:", err);
}
