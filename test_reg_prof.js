const fetch = require('node-fetch');

async function register() {
    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Dr. Test Node",
                email: "drtestnode@example.com",
                password: "SecurePass123!",
                role: "doctor",
                country: "Ghana",
                region: "Accra",
                phoneNumber: "+233200999888",
                whatsappNumber: "+233200999888",
                licenseNumber: "MDC/TEST/001",
                yearsOfExperience: "5",
                currentFacility: "Test Clinic",
                facilityType: "Private"
            })
        });
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await res.json();
            console.log("Status:", res.status);
            console.log("Response:", JSON.stringify(data, null, 2));
        } else {
            console.log("Status:", res.status);
            console.log("Text Response:", await res.text());
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

register();
