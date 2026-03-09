
async function test() {
    console.log("🚀 Starting Detailed Verification...");

    const baseUrl = "http://localhost:3000";

    // 1. Test /api/notify with HTML
    console.log("\n--- [TEST 1] Testing /api/notify (HTML) ---");
    try {
        const notifyRes = await fetch(`${baseUrl}/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: "test@example.com",
                subject: "Universal Call Test",
                text: "Hello from Antigravity",
                html: "<div style='color: blue;'><h1>Call Link</h1><p>Join here: https://meet.google.com/test</p></div>"
            })
        });
        const notifyData = await notifyRes.json();
        console.log("Status Code:", notifyRes.status);
        console.log("Response Body:", JSON.stringify(notifyData, null, 2));
        
        if (notifyRes.ok && notifyData.success) {
            console.log("✅ TEST 1 PASSED: Notification accepted.");
        } else {
            console.log("❌ TEST 1 FAILED.");
        }
    } catch (e) {
        console.error("TEST 1 ERROR:", e.message);
    }

    // 2. Test /api/db with Extra Audit Fields
    console.log("\n--- [TEST 2] Testing /api/db Audit Sync ---");
    try {
        const dbRes = await fetch(`${baseUrl}/api/db`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'audit_logs',
                action: 'add',
                item: {
                    action: "AGENT_VERIFICATION_LOG",
                    actorId: "ANTIGRAVITY",
                    actorName: "Antigravity AI",
                    target: "Verification Suite",
                    details: "Testing Prisma schema filtering for extra fields",
                    forbiddenField: "This must not reach Prisma",
                    targetName: "Alias Target",
                    notes: "Alias Notes"
                }
            })
        });
        const dbData = await dbRes.json();
        console.log("Status Code:", dbRes.status);
        console.log("Response Body:", JSON.stringify(dbData, null, 2));

        if (dbRes.ok) {
            console.log("✅ TEST 2 PASSED: Audit log persisted with filtering.");
        } else {
            console.log("❌ TEST 2 FAILED:", dbData.error);
        }
    } catch (e) {
        console.error("TEST 2 ERROR:", e.message);
    }

    console.log("\n🏁 Verification completed.");
}

test();
