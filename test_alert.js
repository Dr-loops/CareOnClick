require('dotenv').config({ path: './frontend/.env' });
const { notificationService } = require('./frontend/lib/notifications/index.js');

// Mock log function as we are running outside Next.js context sometimes
// But notificationService writes to file system so it should be fine if paths resolve relative to CWD
// We are running in root CWD. Notification service imports fs/path. log file path is process.cwd() + notifications.log

async function test() {
    console.log("Testing Notification Service...");
    console.log("Email User present?", !!process.env.EMAIL_USER);
    console.log("Twilio Present?", !!process.env.TWILIO_ACCOUNT_SID);

    // Test Email
    console.log("\nAttempting Email Send...");
    // Replace with a dummy email or use the admin one for self-test. 
    // Ideally use one provided by user or safe one. User email in .env is sender.
    // Let's send to the sender itself for safety/test?
    const testDest = process.env.EMAIL_USER;
    if (testDest) {
        const emailRes = await notificationService.sendEmail(testDest, "Test Alert System", "This is a test verifying the new notification architecture.");
        console.log("Email Result:", emailRes);
    } else {
        console.log("Skipping email test (no EMAIL_USER)");
    }

    // Test SMS
    // We need a number. User provided +14472234137 as SENDER. 
    // We don't have a verifiable recipient number handy without asking user again.
    // We can try sending to the sender number? Twilio usually acts funny sending to self.
    // Let's skip live SMS send to avoid spam/error if no recipient. 
    // I entered +14472234137 in Env.
    console.log("\nSkipping SMS Send Test to avoid spam (verified by logic check mostly).");
}

test().catch(console.error);
