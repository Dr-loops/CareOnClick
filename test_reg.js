const fetch = require('node-fetch'); // Assuming node-fetch implies available in Next.js environment or standard node 18+ fetch
// Node 18+ has native fetch.

async function register() {
    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Patient Node",
                email: "testnode@example.com",
                password: "SecurePass123!",
                role: "patient",
                country: "Ghana",
                region: "Accra",
                phoneNumber: "+233555999888",
                whatsappNumber: "+233555999888"
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
