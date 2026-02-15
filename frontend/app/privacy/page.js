export default function PrivacyPolicy() {
    return (
        <div className="container main-page">
            <section className="legal-section">
                <div className="legal-header">
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-subtitle">Effective Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="legal-content">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to CareOnClick ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy describes how we collect, use, and share your personal information when you visit our website or use our services.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>We collect information that you strictly provide to us when you register for an account, book an appointment, or communicate with us. This includes:</p>
                    <ul>
                        <li><strong>Personal Identification Data</strong>: Name, Email, Phone Number, Date of Birth, and Address.</li>
                        <li><strong>Protected Health Information (PHI)</strong>: Medical history, symptoms, vital signs, laboratory results, diagnostic reports, and prescriptions.</li>
                        <li><strong>Payment Information</strong>: Processed securely by our third-party payment providers; we do not store full credit card details.</li>
                    </ul>

                    <h2>3. Professional Data Access & Protection</h2>
                    <p>To provide quality healthcare, data access is strictly governed based on professional roles. We recognize the critical role of diagnostic expertise in patient care:</p>
                    <ul>
                        <li><strong>Physicians, Nurses, and Lab Doctors (Lab Scientists)</strong>: These professionals have comprehensive access to your clinical records, vitals, medical history, and diagnostic reports. They are authorized to provide direct consultations, interpret results, and advise on the next steps of your medical journey.</li>
                        <li><strong>Pharmacists</strong>: Access is limited to your prescriptions and relevant medication history for dispensing and safety checks.</li>
                        <li><strong>Dieticians & Psychologists</strong>: Access is restricted to specific specialty notes and dietary or mental health records relevant to your consultation.</li>
                        <li><strong>System Administrators</strong>: Access is limited to technical support, security auditing, and system maintenance. Admins do not access your clinical data except for necessary technical troubleshooting.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement industry-standard technical and organizational security measures, including end-to-end encryption for communications and secure data storage on Supabase with restricted access roles.
                        We prioritize the confidentiality, integrity, and availability of your health data.
                    </p>

                    <h2>5. Data Retention & Deletion</h2>
                    <p>
                        We retain your data as long as necessary to provide clinical services and comply with legal medical record retention requirements.
                        Users may request data deletion; however, certain clinical records must be preserved by law for a specified period.
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us at <a href="mailto:drkalsvirtualhospital@gmail.com">drkalsvirtualhospital@gmail.com</a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
