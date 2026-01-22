# Environment Setup for Real Notifications

Dr. Kal's Virtual Hospital comes with built-in support for **SendGrid (Email)** and **Twilio (SMS)**. By default, it runs in "Simulation Mode", logging notifications to `notifications.log`.

To enable real delivery to your phone and email, follow these steps:

## 1. Create/Edit your Environment File
Create a file named `.env.local` in the root folder (`c:\Users\kfryt\.gemini\antigravity\scratch\dr_kals_virtual_hospital\.env.local`).

## 2. Add API Keys
Copy and paste the following into your `.env.local` file, filling in your actual keys:

```env
# TWILIO (For SMS)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# SENDGRID (For Email)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_sender_email@domain.com
```

## 3. Restart the Server
After saving `env.local`, you must restart the development server for changes to take effect:
1.  Go to your running terminal.
2.  Press `Ctrl+C` to stop `npm run dev`.
3.  Run `npm run dev` again.

## Need Keys?
-   **Twilio**: Sign up at [twilio.com](https://www.twilio.com/) (Trial accounts work but verify phone numbers first).
-   **SendGrid**: Sign up at [sendgrid.com](https://sendgrid.com/).
