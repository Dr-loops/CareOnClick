const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in fetch in Node 18+

async function reproduce() {
    const email = `test_prof_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test Professional';
    const role = 'doctor'; // Standard professional role

    console.log(`Registering user: ${email} with role: ${role}`);

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name,
                role,
                country: 'Test Country',
                region: 'Test Region',
                phoneNumber: '1234567890',
                whatsappNumber: '1234567890',
                licenseNumber: 'LIC12345',
                yearsOfExperience: '5',
                currentFacility: 'Test Hospital',
                facilityType: 'Hospital'
            })
        });

        const data = await response.json();
        console.log('Registration Response:', data);

        if (data.success && data.user && data.user.id) {
            // Now check the status directly from DB if possible, or we might need a way to check via API if an endpoint exists.
            // Since we don't have a direct "get user status" endpoint open to public, we might need to rely on the fact that if this script runs, I can check the DB via another tool or script.
            // But wait, I can use a script that imports prisma to check.
            console.log(`User created with ID: ${data.user.id}. Please check database for verificationStatus.`);
            return data.user.id;
        } else {
            console.error('Registration failed:', data);
        }

    } catch (error) {
        console.error('Error during registration request:', error);
    }
}

reproduce();
