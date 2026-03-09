const email = "takyinaomi025@gmail.com";

async function testNotify() {
    console.log(`Sending test email to ${email}...`);
    try {
        const res = await fetch('http://localhost:3000/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                subject: "Test: Video Consultation Link",
                text: "This is a test message from CareOnClick to verify email delivery.",
                html: "<h2>CareOnClick Test</h2><p>This is a test message to verify email delivery.</p>"
            })
        });

        const data = await res.json();
        console.log("Response:", res.status, data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testNotify();
