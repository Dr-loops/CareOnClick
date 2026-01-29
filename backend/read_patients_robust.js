
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'patients_list.txt');
const buffer = fs.readFileSync(filePath);
let content = buffer.toString('binary').replace(/\x00/g, '');
fs.writeFileSync('patients_decoded.txt', content);
console.log("Decoded and saved to patients_decoded.txt");
