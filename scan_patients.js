
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const patients = new Map();

// Scan users
data.users.filter(u => u.role === 'patient').forEach(u => {
    patients.set(u.id, { name: u.name, email: u.email, id: u.id, source: 'users' });
});

// Scan appointments
data.appointments.forEach(app => {
    if (!patients.has(app.patientId)) {
        // Construct email from name if possible
        const cleanName = app.patientName.toLowerCase().replace(/[^a-z]/g, '');
        const email = `${cleanName}@gmail.com`;

        patients.set(app.patientId, {
            name: app.patientName,
            id: app.patientId,
            email: email,
            source: 'appointments' // These are temporary deduced emails
        });
    }
});

const result = Array.from(patients.values());
fs.writeFileSync('found_patients.json', JSON.stringify(result, null, 2));
console.log(`Saved ${result.length} patients to found_patients.json`);
