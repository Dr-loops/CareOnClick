export default function TermsOfService() {
    return (
        <div className="container main-page">
            <section className="legal-section">
                <div className="legal-header">
                    <h1 className="legal-title">Terms of Service</h1>
                    <p className="legal-subtitle">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="legal-content">
                    <div className="important-notice">
                        <h3>⚠️ Important Notice: Payment Validation</h3>
                        <p><strong>Please note that "Payment" validates your appointment.</strong> Appointment slots are only confirmed and reserved once full payment has been successfully processed. Unpaid bookings may be subject to cancellation or reallocation.</p>
                    </div>

                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using our services, you agree to be bound by these Terms of Service and our **Data & Privacy Policy**. If you do not agree to these terms, including the mandatory arbitration provision and class action waiver, you may not use our services.
                    </p>

                    <h2>2. Medical Disclaimer & Telehealth Consent</h2>
                    <p>
                        CareOnClick provides virtual healthcare consultations. By using our service, you provide **Telehealth Consent**, acknowledging that:
                    </p>
                    <ul>
                        <li>The consultation is conducted via electronic communication (video/audio/chat).</li>
                        <li>While virtual care is highly effective, it is not a substitute for emergency medical care.</li>
                        <li>You understand the risks and benefits of telehealth, including potential technical limitations.</li>
                        <li><strong>If you are experiencing a medical emergency, please call your local emergency services immediately.</strong></li>
                    </ul>

                    <h2>3. User Responsibilities</h2>
                    <p>You are responsible for:</p>
                    <ul>
                        <li>Providing accurate and complete health information to our professional staff.</li>
                        <li>Ensuring your account credentials remain confidential.</li>
                        <li>Paying all fees associated with the services you select to validate your booking.</li>
                    </ul>

                    <h2>4. Professional Ethics & Data</h2>
                    <p>
                        All professionals on our platform (Physicians, Nurses, Lab Scientists, Pharmacists, Dieticians, and Psychologists) are bound by professional ethics and our strict internal Data Policy regarding the handling of your patient information.
                    </p>

                    <h2>5. Payment & Refunds</h2>
                    <p>
                        All services require upfront payment to validate the appointment. Refunds are processed in accordance with our Refund Policy, typically requiring at least 24 hours notice for cancellations.
                    </p>

                    <h2>6. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        For any questions regarding these Terms, please contact us at <a href="mailto:drkalsvirtualhospital@gmail.com">drkalsvirtualhospital@gmail.com</a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
