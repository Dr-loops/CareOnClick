"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ROLES } from '@/lib/auth_constants';
import { ALL_COUNTRIES, getRegions, getCountryCode } from '@/lib/location_data';
import Link from 'next/link';
import { Suspense } from 'react';
import { Input } from '@/components/ui/Input';

function RegisterForm() {
    const { register } = useAuth();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'patient';
    const isProfessional = type === 'professional';
    const isAdmin = type === 'admin';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: isProfessional ? ROLES.DOCTOR : (isAdmin ? ROLES.ADMIN : ROLES.PATIENT),
        adminSecret: '',
        // Common Fields (Phone, Whatsapp, Location)
        country: 'Ghana', // Default
        region: '',
        phonePrefix: '+233',
        phoneNumber: '',
        whatsappPrefix: '+233',
        whatsappNumber: '',
        // Professional Specific
        licenseNumber: '',
        yearsOfExperience: '',
        currentFacility: '',
        facilityType: '',
    });

    const [availableRegions, setAvailableRegions] = useState([]);

    useEffect(() => {
        const regions = getRegions(formData.country);
        setAvailableRegions(regions);
        // Reset region when country changes, unless the current region happens to be in the new list (unlikely between countries)
        // or just allow text if regions are empty
        if (regions.length > 0) {
            setFormData(prev => ({ ...prev, region: regions[0] })); // Default to first region
        } else {
            setFormData(prev => ({ ...prev, region: '' }));
        }

        // Update Prefixes based on country
        const code = getCountryCode(formData.country);
        setFormData(prev => ({
            ...prev,
            phonePrefix: code,
            whatsappPrefix: code
        }));
    }, [formData.country]);

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Construct Payload
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: isProfessional ? formData.role : (isAdmin ? ROLES.ADMIN : ROLES.PATIENT),
            adminSecret: isAdmin ? formData.adminSecret : undefined,
            // Location & Contact
            country: formData.country,
            region: formData.region,
            // Combine Prefix + Number
            phoneNumber: formData.phonePrefix + formData.phoneNumber,
            whatsappNumber: formData.whatsappPrefix + formData.whatsappNumber,

            // Professional Specific
            licenseNumber: isProfessional ? formData.licenseNumber : undefined,
            yearsOfExperience: isProfessional ? formData.yearsOfExperience : undefined,
            currentFacility: isProfessional ? formData.currentFacility : undefined,
            facilityType: isProfessional ? formData.facilityType : undefined,
        };

        const res = await register(payload);
        if (!res.success) {
            setError(res.error || "Registration failed");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', margin: '4rem auto', paddingBottom: '4rem' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        {isProfessional ? '🩺' : (isAdmin ? '🛡️' : '👤')}
                    </div>
                    <h2>{isProfessional ? 'Professional Registration' : (isAdmin ? 'Admin Portal Setup' : 'Patient Registration')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isProfessional
                            ? 'Join our network of certified healthcare providers.'
                            : (isAdmin ? 'Secure setup for system administrators.' : 'Create your secure health profile.')}
                    </p>
                </div>

                {error && <p style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name</label>
                        <input name="name" placeholder="Full Name" className="input-field" required onChange={handleChange} suppressHydrationWarning />
                    </div>

                    {isAdmin && (
                        <div style={{ marginBottom: '1.5rem', background: '#fefce8', padding: '1rem', borderRadius: '8px', border: '1px solid #fde047' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#854d0e' }}>🔑 Admin Secret Key</label>
                            <Input name="adminSecret" type="password" placeholder="Enter System Security Code" className="input-field" required onChange={handleChange} style={{ borderColor: '#fde047' }} suppressHydrationWarning fullWidth />
                            <p style={{ fontSize: '0.8rem', color: '#a16207', marginTop: '0.5rem' }}>Restricted access. This key is required to create an admin account.</p>
                        </div>
                    )}

                    {/* LOCATION SECTION - FOR ALL USERS */}
                    <div className="grid-responsive grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Country</label>
                            <select name="country" className="input-field" required onChange={handleChange} value={formData.country} suppressHydrationWarning>
                                {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Region / State</label>
                            {availableRegions.length > 0 ? (
                                <select name="region" className="input-field" required onChange={handleChange} value={formData.region} suppressHydrationWarning>
                                    {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            ) : (
                                <input name="region" placeholder="Enter Region" className="input-field" required onChange={handleChange} value={formData.region} suppressHydrationWarning />
                            )}
                        </div>
                    </div>

                    {/* CONTACT SECTION - FOR ALL USERS */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Active Phone Number</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input-field"
                                style={{ width: '80px', background: '#eee', textAlign: 'center' }}
                                readOnly
                                title="Country Code"
                                value={formData.phonePrefix}
                                suppressHydrationWarning
                            />
                            <input
                                name="phoneNumber" type="tel" placeholder="Number" className="input-field" required
                                onChange={handleChange}
                                style={{ flex: 1 }}
                                suppressHydrationWarning
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>WhatsApp Number</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div
                                className="input-field"
                                style={{
                                    width: '80px',
                                    background: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #bbf7d0'
                                }}
                                title={`Country Code: ${formData.whatsappPrefix}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <input
                                name="whatsappNumber" type="tel" placeholder="WhatsApp Number" className="input-field" required
                                onChange={handleChange}
                                style={{ flex: 1 }}
                                suppressHydrationWarning
                            />
                        </div>
                    </div>

                    {isProfessional && (
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--color-navy)' }}>Professional Credentials</h4>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role</label>
                                <select name="role" className="input-field" onChange={handleChange} value={formData.role} suppressHydrationWarning>
                                    <option value={ROLES.DOCTOR}>Doctor / Physician</option>
                                    <option value={ROLES.NURSE}>Nurse</option>
                                    <option value={ROLES.SCIENTIST}>Lab Scientist</option>
                                    <option value={ROLES.PHARMACIST}>Pharmacist</option>
                                    <option value={ROLES.DIETICIAN}>Dietician</option>
                                    <option value={ROLES.PSYCHOLOGIST}>Psychologist</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>License Number</label>
                                <input name="licenseNumber" placeholder="e.g. MDC/12345" className="input-field" required onChange={handleChange} suppressHydrationWarning />
                            </div>

                            <div className="grid-responsive grid-cols-2" style={{ gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Experience (Years)</label>
                                    <input name="yearsOfExperience" type="number" min="0" className="input-field" required onChange={handleChange} suppressHydrationWarning />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Facility Type</label>
                                    <select name="facilityType" className="input-field" required onChange={handleChange} suppressHydrationWarning>
                                        <option value="">Select Type</option>
                                        <option value="Government">Government</option>
                                        <option value="Private">Private</option>
                                        <option value="Mission">Mission</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Facility Name</label>
                                <input name="currentFacility" placeholder="Hospital / Clinic Name" className="input-field" required onChange={handleChange} suppressHydrationWarning />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
                        <input name="email" type="email" placeholder="Email Address" className="input-field" required onChange={handleChange} suppressHydrationWarning />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
                        <Input name="password" type="password" className="input-field" required onChange={handleChange} suppressHydrationWarning fullWidth />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirm Password</label>
                        <Input name="confirmPassword" type="password" className="input-field" required onChange={handleChange} suppressHydrationWarning fullWidth />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} suppressHydrationWarning>
                        {isProfessional ? 'Submit for Verification' : 'Register Account'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>Wrong path?</p>
                    <Link href="/" style={{ color: 'var(--color-navy)', fontSize: '0.9rem' }}>← choose a different account type</Link>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
