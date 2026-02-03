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
                        <li>Personal Identification Data (Name, Email, Phone Number, Date of Birth).</li>
                        <li>Health Information (Medical History, Symptoms, Vitals).</li>
                        <li>Payment Information (processed securely by our third-party payment providers).</li>
                    </ul>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use your personal information to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our virtual hospital services.</li>
                        <li>Process your appointments and payments.</li>
                        <li>Communicate with you strictly regarding your appointments and health updates.</li>
                        <li>Improve our platform and user experience.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures to protect the security of your personal information.
                        However, please remember that no transmission over the internet is 100% secure.
                    </p>

                    <h2>5. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us at <a href="mailto:drkalsvirtualhospital@gmail.com">drkalsvirtualhospital@gmail.com</a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
