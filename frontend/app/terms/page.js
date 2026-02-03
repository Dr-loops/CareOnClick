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
                        By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, including the mandatory arbitration provision and class action waiver, you may not use our services.
                    </p>

                    <h2>2. Medical Disclaimer</h2>
                    <p>
                        CareOnClick provides virtual healthcare consultations. While our professionals are certified, our services are not a substitute for emergency medical care.
                        <strong>If you are experiencing a medical emergency, please call your local emergency services immediately.</strong>
                    </p>

                    <h2>3. User Responsibilities</h2>
                    <p>You are responsible for:</p>
                    <ul>
                        <li>Providing accurate and complete health information.</li>
                        <li>Ensuring your account credentials remain confidential.</li>
                        <li>Paying all fees associated with the services you select.</li>
                    </ul>

                    <h2>4. Payment & Refunds</h2>
                    <p>
                        All services require upfront payment to validate the appointment. Refunds are processed in accordance with our Refund Policy, typically requiring at least 24 hours notice for cancellations.
                    </p>

                    <h2>5. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        For any questions regarding these Terms, please contact us at <a href="mailto:drkalsvirtualhospital@gmail.com">drkalsvirtualhospital@gmail.com</a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
