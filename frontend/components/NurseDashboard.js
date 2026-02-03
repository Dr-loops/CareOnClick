"use client";
import { useState, useEffect } from 'react';
import { saveGlobalRecord, getGlobalData, KEYS, updateNotificationStatus, updateAppointment } from '@/lib/global_sync';
import { analyzeResult, analyzeBP } from '@/lib/medical_analysis';
import { useGlobalSync } from '@/lib/hooks/useGlobalSync';
import { useSWRConfig } from 'swr'; // [FIX] Import SWR Config

import PatientRecordFinder from './PatientRecordFinder';

import CollaborationTab from './CollaborationTab';
import { AI_SUGGESTIONS } from '@/lib/physician_data';
import Toast from './Toast';
import { usePatients, useTasks } from '@/lib/hooks/useClinicalData';
import { useStaff } from '@/lib/hooks/useStaff';
import VitalsMonitor from './VitalsMonitor';
import PatientList from './PatientList';
import DictationRecorder from './DictationRecorder';
import WhatsAppButton from './WhatsAppButton';
import CommunicationHub from './CommunicationHub';
import VideoConsultation from './VideoConsultation'; // [NEW]
import ProfileModal from './ProfileModal'; // [NEW]
import BillingInvoiceModal from './BillingInvoiceModal'; // [NEW] Invoice Modal


const AlertsView = ({ professionalName, role, professionalId }) => {
    const notifications = getGlobalData(KEYS.NOTIFICATIONS, []);
    const myNotifications = notifications.filter(n =>
        (n.professionalName === professionalName || n.recipientId === role || n.recipientId === professionalId || n.recipientId === 'STAFF') &&
        n.status !== 'Dismissed'
    );

    const handleAction = (id, action) => {
        if (action === 'Dismiss') {
            updateNotificationStatus(id, { status: 'Dismissed' });
        } else if (action === 'Accept') {
            const notif = notifications.find(n => n.id === id);
            updateNotificationStatus(id, { status: 'Accepted' });

            // Log confirmation activity
            if (notif && notif.details?.appointmentId) {
                updateAppointment(notif.details.appointmentId, {
                    status: 'Confirmed',
                    updatedBy: professionalName
                });
            }

            alert('Appointment Accepted! Patient will be notified.');
        } else if (action === 'Snooze') {
            updateNotificationStatus(id, { status: 'Snoozed' });
        }
    };

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <h3>Recent Alerts & Notifications 🔔</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Stay updated with patient bookings and payment confirmations.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h4>No new alerts</h4>
                        <p style={{ color: '#64748b' }}>Check back later for new patient activities.</p>
                    </div>
                ) : (
                    myNotifications.map(notif => (
                        <div key={notif.id} className="card" style={{
                            borderLeft: `5px solid ${notif.type === 'APPOINTMENT_BOOKING' ? '#3b82f6' : '#10b981'}`,
                            background: notif.status === 'Unread' ? '#f0f9ff' : 'white',
                            position: 'relative',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e293b' }}>{notif.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0' }}>{new Date(notif.timestamp).toLocaleString()}</p>
                                </div>
                                <span style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    background: notif.status === 'Accepted' ? '#dcfce7' : '#f1f5f9',
                                    color: notif.status === 'Accepted' ? '#15803d' : '#475569'
                                }}>
                                    {notif.status}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 1rem 0' }}>{notif.message}</p>

                            {notif.details && (
                                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {notif.type === 'APPOINTMENT_BOOKING' ? (
                                        <>
                                            <div><strong>Patient:</strong> {notif.details.patientName}</div>
                                            <div><strong>Type:</strong> {notif.details.appointmentType}</div>
                                            <div><strong>Date:</strong> {notif.details.date} at {notif.details.time}</div>
                                            <div><strong>Reason:</strong> {notif.details.reason}</div>
                                            {notif.details.balanceDue > 0 ? (
                                                <div style={{ marginTop: '0.5rem', color: '#dc2626', fontWeight: 'bold' }}>
                                                    ⚠️ Part Payment: GHS {notif.details.amountPaid} (Bal: {notif.details.balanceDue})
                                                </div>
                                            ) : notif.details.amountPaid ? (
                                                <div style={{ marginTop: '0.5rem', color: '#16a34a', fontWeight: 'bold' }}>
                                                    ✅ Full Payment: GHS {notif.details.amountPaid}
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        <>
                                            <div><strong>Patient:</strong> {notif.details.patientName}</div>
                                            <div><strong>Amount:</strong> {notif.details.amount}</div>
                                            <div><strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>Confirmed</span></div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                {notif.type === 'APPOINTMENT_BOOKING' && notif.status !== 'Accepted' && (
                                    <>
                                        <button onClick={() => handleAction(notif.id, 'Accept')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Accept</button>
                                        <button onClick={() => alert('Feature coming soon: Suggesting alternative time.')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Suggest Alt Time</button>
                                    </>
                                )}
                                <button onClick={() => handleAction(notif.id, 'Snooze')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Snooze</button>
                                <button onClick={() => handleAction(notif.id, 'Dismiss')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#dc2626' }}>Dismiss</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export default function NurseDashboard({ user }) {
    useGlobalSync();
    // const router = useRouter(); // Unused
    const { staff } = useStaff();


    const { mutate } = useSWRConfig(); // [FIX] Get mutate function
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null); // [NEW] { patient: {}, isOpen: true/false }

    // [NEW] Profile Modal State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(user); // Local user state for immediate updates

    // Sync userProfile with latest data from useStaff (truth from DB)
    useEffect(() => {
        if (staff && staff.length > 0) {
            const me = staff.find(s => s.id === user.id);
            if (me) {
                console.log("Syncing fresh profile data", me);
                setUserProfile(prev => ({ ...prev, ...me }));
            }
        }
    }, [staff, user.id]);

    // Vitals Entry State
    const [vitalsInput, setVitalsInput] = useState({
        hr: '', bp: '', spo2: '', temp: '', rr: '', weight: '', glucose: ''
    });

    const handleVitalChange = (e) => {
        const { name, value } = e.target;
        setVitalsInput(prev => ({ ...prev, [name]: value }));
    };

    // Fetch Real Data
    const { patients, isLoading: isLoadingPatients } = usePatients(searchQuery);
    const { tasks, mutate: mutateTasks } = useTasks(selectedPatientId);

    // Normalize patients for display
    const normalizedPatients = patients.map(p => ({
        id: p.id,
        name: p.name,
        pathNumber: p.pathNumber,
        age: p.profile?.dateOfBirth ? new Date().getFullYear() - new Date(p.profile.dateOfBirth).getFullYear() : 'N/A',
        gender: p.profile?.gender || 'Unknown',
        room: p.profile?.currentRoom || 'N/A',
        status: p.profile?.conditionStatus || 'Stable',
        vitals: p.latestVital ? {
            temp: p.latestVital.temperature,
            bp: p.latestVital.bloodPressure,
            hr: p.latestVital.heartRate,
            spo2: p.latestVital.spo2
        } : { temp: '--', bp: '--/--', hr: '--', spo2: '--' },
        alerts: p.activeAlerts || [],
        allergy: p.profile?.allergies || 'None',
        history: p.profile?.medicalHistory || 'None',
        phoneNumber: p.phoneNumber || p.profile?.phoneNumber,
        whatsappNumber: p.whatsappNumber || p.profile?.whatsappNumber
    }));

    const [isRecording, setIsRecording] = useState(false);
    const [dictatedNote, setDictatedNote] = useState('');
    const [toast, setToast] = useState(null);

    // [NEW] Patient Engagement & Requests State
    const [selectedFile, setSelectedFile] = useState(null);
    const [requests, setRequests] = useState([
        { id: '1', from: 'Yaw Adom', time: '10 mins ago', message: 'Can I get another pillow please?', status: 'Pending' },
        { id: '2', from: 'Sarah Lee', time: '45 mins ago', message: 'Feeling nauseous after medication.', status: 'Pending' }
    ]);

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }
        if (!selectedPatientId) {
            alert('Please select a patient first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/uploads', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // Send the uploaded file link to patient (simulated)
                alert(`File uploaded: ${data.filename}. Sent to patient!`);
                setSelectedFile(null);
            } else {
                alert('Upload failed.');
                console.error(await res.json());
            }
        } catch (e) {
            console.error('Upload Error:', e);
            alert('Error during upload.');
        }
    };

    const handleSendResource = (resourceName) => {
        if (!selectedPatientId) return alert('Select a patient');
        alert(`Sending "${resourceName}" to ${selectedPatient.name}...`);
        setTimeout(() => alert('Resource sent successfully!'), 1000);
    };

    const markRequestDone = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id));
        // In real app, API call to update status
    };


    // Load dynamic vitals and notes from global store
    const globalRecords = getGlobalData(KEYS.RECORDS, []);

    // Group notes by patientId from global records
    const nurseNotes = globalRecords.reduce((acc, rec) => {
        // Find patient to matching pathNumber
        const patient = normalizedPatients.find(p => p.pathNumber === rec.pathNumber);
        if (patient && rec.structuredResults?.results?.note) {
            if (!acc[patient.id]) acc[patient.id] = [];
            acc[patient.id].push({
                time: rec.time,
                author: rec.scientist || 'Staff',
                text: rec.structuredResults.results.note
            });
        }
        return acc;
    }, {});

    // Derived state: Filtered patients
    // Filtering is handled by API query or normalized map, but local filter supports incomplete queries
    // We strictly use normalizedPatients which is derived from API data
    const displayPatients = normalizedPatients;

    const selectedPatient = normalizedPatients.find(p => p.id === selectedPatientId) || normalizedPatients[0];

    useEffect(() => {
        if (searchQuery && patients.length > 0) {
            const found = patients[0];
            if (found && found.id !== selectedPatientId) {
                setSelectedPatientId(found.id);
            }
        }
    }, [searchQuery, patients, selectedPatientId]);

    const fetchMessages = async () => {
        if (!selectedPatientId) return;
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages?patientId=${selectedPatientId}`);
            if (res.ok) setMessages(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'communication' && selectedPatientId) {
            fetchMessages();
        }
    }, [activeTab, selectedPatientId]);


    const toggleTask = async (id) => {
        // Optimistic update would go here, for now simple API call
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                status: task.status === 'Completed' ? 'Pending' : 'Completed',
                completedBy: user.name
            })
        });
        mutateTasks(); // Refresh
    };

    const handleAddNote = (patientId, note) => {
        const patient = normalizedPatients.find(p => p.id === patientId);
        saveGlobalRecord({
            pathNumber: patient?.pathNumber || 'UNKNOWN',
            fileName: 'Nursing Log / Clinical Observation',
            unit: 'Nursing',
            scientist: user.name,
            professionalRole: 'NURSE',
            structuredResults: {
                testName: 'Daily Nursing Observation',
                results: { note }
            }
        });
        alert('Nursing note has been filed globally.');
    };

    // [NEW] Handle Profile Update
    const handleProfileUpdate = (updatedUser) => {
        setUserProfile(updatedUser);
        setIsProfileOpen(false);
        alert('Profile updated successfully!');
    };

    // [FIX] Added missing getAnalysis helper
    const getAnalysis = (fieldName, value) => {
        if (!value) return null;
        // Safely handle missing selectedPatient
        const sp = selectedPatient || {};
        const age = sp.age && sp.age !== 'N/A' ? parseInt(sp.age) : 30;
        const sex = sp.gender || 'Male';

        if (fieldName === 'bp') return analyzeBP(value, age);

        const map = {
            'hr': { cat: 'VITALS', test: 'HR' },
            'spo2': { cat: 'VITALS', test: 'SpO2' },
            'temp': { cat: 'VITALS', test: 'Temp' },
            'rr': { cat: 'VITALS', test: 'RR' },
            'glucose': { cat: 'VITALS', test: 'Glucose' },
        };

        const def = map[fieldName];
        if (!def) return null;

        return analyzeResult(def.cat, def.test, value, age, sex);
    };

    // Helper functions removed (renderVitalsCard)
    return (
        <div className="nurse-grid">
            {isProfileOpen && (
                <ProfileModal
                    user={userProfile}
                    onClose={() => setIsProfileOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style jsx>{`
                .nurse-grid { display: grid; grid-template-columns: 240px 1fr; min-height: 80vh; gap: 1px; background: #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                @media (max-width: 768px) {
                    .nurse-grid { grid-template-columns: 1fr !important; }
                    aside { display: none; }
                    .nurse-grid { display: flex; flex-direction: column; }
                }

                .vital-box { padding: 0.5rem; border-radius: 8px; text-align: center; }
                .nav-btn { width: 100%; border: none; padding: 1rem; text-align: left; background: white; cursor: pointer; transition: 0.2s; display: flex; alignItems: center; gap: 0.8rem; font-weight: 500; }
                .nav-btn:hover { background: #f8f9fa; }
                .nav-btn.active { background: var(--color-navy); color: white; }
                .tab-content { padding: 2rem; background: white; height: 100%; overflow-y: auto; }
                .card-hover { transition: transform 0.2s; border: 1px solid #eee; }
                .card-hover:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .badge-alert { background: #ff4d4f; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
                .status-chip { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
                .clear-btn { position: absolute; right: 10px; top: 8px; background: #eee; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #666; }
                .clear-btn:hover { background: #ddd; }
            `}</style>

            {/* Sidebar Navigation */}
            <aside style={{ background: 'white', borderRight: '1px solid #eee' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        style={{
                            width: '80px', height: '80px', background: 'var(--color-navy)', color: 'white',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', margin: '0 auto 0.5rem', cursor: 'pointer', overflow: 'hidden',
                            border: '3px solid #e2e8f0', transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        title="Click to Edit Profile"
                    >
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            '👩‍⚕️'
                        )}
                    </div>
                    <h4 style={{ margin: 0 }}>{userProfile.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>{userProfile.specialization || 'Registered Nurse'}</p>
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.75rem', marginTop: '0.2rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Edit Profile
                    </button>
                </div>
                <nav>
                    <button onClick={() => setActiveTab('patients')} className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`}>👥 Patient List</button>
                    <button onClick={() => setActiveTab('chart')} className={`nav-btn ${activeTab === 'chart' ? 'active' : ''}`}>📋 Patient Chart</button>
                    <button onClick={() => setActiveTab('records')} className={`nav-btn ${activeTab === 'records' ? 'active' : ''}`}>🗂️ Patient Records</button>
                    <button onClick={() => setActiveTab('tasks')} className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}>🩺 Tasks & Meds</button>
                    <button onClick={() => setActiveTab('monitoring')} className={`nav-btn ${activeTab === 'monitoring' ? 'active' : ''}`}>📈 Vitals Trends</button>
                    <button onClick={() => setActiveTab('communication')} className={`nav-btn ${activeTab === 'communication' ? 'active' : ''}`}>📨 Communication Hub</button>
                    <button onClick={() => setActiveTab('action-center')} className={`nav-btn ${activeTab === 'action-center' ? 'active' : ''}`}>📋 Action Center</button>
                    <button onClick={() => setActiveTab('engagement')} className={`nav-btn ${activeTab === 'engagement' ? 'active' : ''}`}>📱 Patient Engagement</button>
                    <button onClick={() => setActiveTab('collaboration')} className={`nav-btn ${activeTab === 'collaboration' ? 'active' : ''}`}>👨‍⚕️ Collaboration</button>
                    <button onClick={() => setActiveTab('discharge')} className={`nav-btn ${activeTab === 'discharge' ? 'active' : ''}`}>📝 Discharge Prep</button>
                    <button onClick={() => setActiveTab('alerts')} className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}>🔔 Alerts</button>
                </nav>
            </aside>

            {/* Main Workspace */}
            <main className="tab-content">
                {/* Header with Search */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Managing unit operations and patient care.</p>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '10px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Find Patient by Name/PATH/ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '0.6rem 2.5rem 0.6rem 2.5rem', borderRadius: '25px', border: '1px solid #ddd', width: '320px', outline: 'none' }}
                        />
                        {searchQuery && (
                            <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>
                </header>

                {/* Tabs Rendering */}
                {activeTab === 'patients' && (
                    <>
                        {isLoadingPatients ? <div style={{ padding: '2rem' }}>Loading patients...</div> : (
                            <PatientList
                                patients={displayPatients}
                                selectedId={selectedPatientId}
                                onSelect={setSelectedPatientId}
                            />
                        )}
                    </>
                )}

                {activeTab === 'chart' && selectedPatient && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <img src="/logo_new.jpg" alt="CareOnClick Logo" style={{ height: '40px' }} />
                                        <h3 style={{ margin: 0 }}>Patient Information</h3>
                                    </div>
                                    {searchQuery && <span style={{ fontSize: '0.75rem', color: 'var(--color-navy)', fontWeight: 'bold' }}>MATCH FOUND</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                    <div><strong>Name:</strong> {selectedPatient.name}</div>
                                    <div><strong>Age/Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</div>
                                    <div><strong>PATH No:</strong> {selectedPatient.pathNumber}</div>
                                    <div><strong>Room:</strong> {selectedPatient.room}</div>
                                    <div style={{ gridColumn: 'span 2' }}><strong>Allergies:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{selectedPatient.allergy}</span></div>
                                    <div style={{ gridColumn: 'span 2' }}><strong>Medical History:</strong> {selectedPatient.history}</div>
                                    <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                        {selectedPatient.phoneNumber && (
                                            <a href={`tel:${selectedPatient.phoneNumber.replace(/[^\d+]/g, '')}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                📞 Call {selectedPatient.phoneNumber}
                                            </a>
                                        )}
                                        {selectedPatient.whatsappNumber && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <WhatsAppButton phoneNumber={selectedPatient.whatsappNumber} label="Chat on WhatsApp" message={`Hello ${selectedPatient.name}, this is Nurse ${user.name}.`} />
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3>Nurse Observations</h3>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
                                    {(nurseNotes[selectedPatient.id] || []).length === 0 ? <p style={{ color: '#999', fontSize: '0.85rem' }}>No updates yet for this shift.</p> :
                                        nurseNotes[selectedPatient.id].map((n, i) => (
                                            <div key={i} style={{ marginBottom: '0.8rem', fontSize: '0.85rem', borderBottom: '1px solid #f9f9f9', paddingBottom: '0.4rem' }}>
                                                <div style={{ color: '#888', fontSize: '0.7rem' }}>{n.time} • {n.author}</div>
                                                <div>{n.text}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <DictationRecorder
                                        onSave={(note) => handleAddNote(selectedPatient.id, note)}
                                        placeholder="Type or dictate nursing note..."
                                    />
                                    {/* [NEW] Print Invoice Button */}
                                    <button
                                        onClick={() => setInvoiceData({ patient: selectedPatient, isOpen: true })}
                                        className="btn btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #ccc', background: 'white' }}
                                        title="Generate Patient Bill"
                                    >
                                        🖨️ Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3>Current Medications</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '0.5rem' }}>Drug</th>
                                        <th style={{ padding: '0.5rem' }}>Dose</th>
                                        <th style={{ padding: '0.5rem' }}>Freq</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style={{ padding: '0.5rem' }}>Metformin</td><td style={{ padding: '0.5rem' }}>500mg</td><td style={{ padding: '0.5rem' }}>BID</td></tr>
                                    <tr><td style={{ padding: '0.5rem' }}>Lisinopril</td><td style={{ padding: '0.5rem' }}>10mg</td><td style={{ padding: '0.5rem' }}>QD</td></tr>
                                    <tr><td style={{ padding: '0.5rem' }}>Salbutamol</td><td style={{ padding: '0.5rem' }}>Inhaler</td><td style={{ padding: '0.5rem' }}>PRN</td></tr>
                                </tbody>
                            </table>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff7e6', borderRadius: '8px', borderLeft: '4px solid #ffa940' }}>
                                <h4 style={{ margin: '0 0 0.5rem' }}>💡 Reminders</h4>
                                <ul style={{ margin: 0, fontSize: '0.85rem', paddingLeft: '1.2rem' }}>
                                    <li>Monitor for dizziness post-administration.</li>
                                    <li>Encourage fluid intake.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="vital-box" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', flex: 1 }}>
                                <div style={{ color: '#389e0d', fontWeight: 'bold' }}>{tasks.filter(t => t.status === 'Completed').length}</div>
                                <div style={{ fontSize: '0.7rem' }}>COMPLETED</div>
                            </div>
                            <div className="vital-box" style={{ background: '#fff7e6', border: '1px solid #ffd591', flex: 1 }}>
                                <div style={{ color: '#d46b08', fontWeight: 'bold' }}>{tasks.filter(t => t.status !== 'Completed').length}</div>
                                <div style={{ fontSize: '0.7rem' }}>PENDING</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {tasks
                                .filter(task => {
                                    if (!searchQuery) return true;
                                    const patient = normalizedPatients.find(p => p.id === task.patientId);
                                    if (!patient) return false;
                                    return (patient.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (patient.pathNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (patient.id || '').toLowerCase() === searchQuery.toLowerCase();
                                })
                                .map(task => {
                                    const patient = normalizedPatients.find(p => p.id === task.patientId);
                                    if (!patient) return null;
                                    return (
                                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: task.status === 'Completed' ? '#fafafa' : 'white', border: '1px solid #eee', borderRadius: '8px', opacity: task.status === 'Completed' ? 0.6 : 1 }}>
                                            <input type="checkbox" checked={task.status === 'Completed'} onChange={() => toggleTask(task.id)} style={{ width: '20px', height: '20px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>{task.description}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{patient.name} ({patient.room}) • {task.priority} • <span style={{ color: 'var(--color-navy)', fontWeight: 'bold' }}>{task.category}</span></div>
                                            </div>
                                            {task.status === 'Completed' && <span style={{ color: 'green', fontSize: '0.8rem' }}>✓ Logged</span>}
                                        </div>
                                    );
                                })}
                            {tasks.filter(task => {
                                if (!searchQuery) return true;
                                const patient = normalizedPatients.find(p => p.id === task.patientId);
                                if (!patient) return false;
                                return (patient.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (patient.pathNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (patient.id || '').toLowerCase() === searchQuery.toLowerCase();
                            }).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No tasks found for this search.</div>
                                )}
                        </div>
                    </div>
                )}

                {activeTab === 'records' && (
                    <div style={{ padding: '0 1.5rem' }}>
                        <PatientRecordFinder
                            patients={normalizedPatients}
                            user={user}
                            title="Patient Records Search"
                        />
                    </div>
                )}


                {/* Billing Invoice Modal */}
                {invoiceData && (
                    <BillingInvoiceModal
                        isOpen={invoiceData.isOpen}
                        onClose={() => setInvoiceData(null)}
                        patient={invoiceData.patient}
                        professionalName={user.name}
                        professionalRole="Nurse"
                    />
                )}

                {activeTab === 'monitoring' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0 }}>Vitals Monitoring & Entry</h3>
                            {selectedPatient && <span className="badge badge-primary">{selectedPatient.name}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Manual Entry Form */}
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--color-navy)' }}>📝 Record New Vitals</h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const vitals = {
                                        hr: formData.get('hr'),
                                        bp: formData.get('bp'),
                                        spo2: formData.get('spo2'),
                                        temp: formData.get('temp'),
                                        rr: formData.get('rr'),
                                        weight: formData.get('weight'),
                                        glucose: formData.get('glucose')
                                    };

                                    if (!selectedPatientId) return alert('Select a patient first');

                                    try {
                                        const res = await fetch('/api/vitals', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                patientId: selectedPatientId,
                                                patientName: selectedPatient.name,
                                                results: vitals
                                            })
                                        });

                                        if (res.ok) {
                                            alert('Vitals recorded successfully!');
                                            // [FIX] Immediate Refresh
                                            // Mutate vitals for this patient to update EKG/Charts
                                            mutate(`/api/vitals?patientId=${selectedPatientId}`);
                                            // Mutate patient list to update "Latest Vital" column
                                            mutate((key) => typeof key === 'string' && key.startsWith('/api/patients'));

                                            // Keep form data per user request
                                            // setVitalsInput({ hr: '', bp: '', spo2: '', temp: '', rr: '', weight: '', glucose: '' }); 
                                            // Ideally refresh vitals view here
                                        } else {
                                            alert('Failed to record vitals');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error recording vitals');
                                    }
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Heart Rate (bpm)', name: 'hr', ph: 'e.g. 72' },
                                            { label: 'Blood Pressure', name: 'bp', ph: 'e.g. 120/80' },
                                            { label: 'SpO2 (%)', name: 'spo2', ph: 'e.g. 98' },
                                            { label: 'Temp (°C)', name: 'temp', ph: 'e.g. 36.5' },
                                            { label: 'Resp. Rate', name: 'rr', ph: 'e.g. 16' },
                                            { label: 'Weight (kg)', name: 'weight', ph: 'e.g. 70.5' },
                                            { label: 'Glucose (mmol/L)', name: 'glucose', ph: 'e.g. 5.5' }
                                        ].map(field => {
                                            const analysis = getAnalysis(field.name, vitalsInput[field.name]);
                                            return (
                                                <div key={field.name}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                        {field.label}
                                                        {analysis && (
                                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: analysis.color, fontWeight: 'bold' }}>
                                                                {analysis.flag !== 'Normal' ? `⚠️ ${analysis.flag}` : '✅ Normal'}
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        name={field.name}
                                                        value={vitalsInput[field.name]}
                                                        onChange={handleVitalChange}
                                                        type={field.name === 'bp' ? 'text' : 'number'}
                                                        step={field.name === 'temp' || field.name === 'weight' || field.name === 'glucose' ? '0.1' : undefined}
                                                        className="input"
                                                        placeholder={field.ph}
                                                        required={field.name !== 'weight' && field.name !== 'glucose'}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderColor: analysis?.flag === 'Critical High' || analysis?.flag === 'Critical Low' ? 'red' : '#e2e8f0',
                                                            background: analysis?.flag && analysis.flag !== 'Normal' ? '#fff7ed' : 'white'
                                                        }}
                                                    />
                                                    {analysis && analysis.range && <div style={{ fontSize: '0.7rem', color: '#888' }}>Target: {analysis.range}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Vitals</button>
                                </form>
                            </div>

                            {/* Live Monitor */}
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--color-navy)' }}>📡 Live Feed</h4>
                                <VitalsMonitor patient={selectedPatient} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Collaboration Tab */}
                {activeTab === 'collaboration' && (
                    <CollaborationTab user={user} selectedPatientId={selectedPatientId} />
                )}

                {/* Communication Hub Tab */}
                {activeTab === 'communication' && (
                    <CommunicationHub
                        user={user}
                        patients={normalizedPatients}
                        staff={staff}
                        initialPatientId={selectedPatientId}
                        onPatientSelect={(p) => setSelectedPatientId(p.id)}
                    />
                )}

                {/* Action Center Tab */}
                {activeTab === 'action-center' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3>Orders & Observations</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => {
                                            setIsRecording(!isRecording);
                                            if (!isRecording) setDictatedNote('Patient is stable but complaining of mild pain in lower abdomen.');
                                        }}>{isRecording ? '🔴 Stop' : '🎤 Dictate'}</button>
                                        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => {
                                            if (dictatedNote) {
                                                saveGlobalRecord({
                                                    pathNumber: selectedPatient?.pathNumber || 'UNKNOWN',
                                                    fileName: 'Nurse Observation (Dictated)',
                                                    unit: 'Nursing',
                                                    scientist: user.name,
                                                    professionalRole: 'NURSE',
                                                    structuredResults: {
                                                        testName: 'Dictated Observation',
                                                        results: { note: dictatedNote }
                                                    }
                                                });
                                                setDictatedNote('');
                                                setIsRecording(false);
                                                alert('Observation saved!');
                                            } else {
                                                alert('Please dictate or type a note first.');
                                            }
                                        }}>+ Save Note</button>
                                    </div>
                                </div>

                                {isRecording && <div style={{ background: '#fff1f2', padding: '0.8rem', borderRadius: '8px', border: '1px solid #fda4af', marginBottom: '1rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    Transcribing: {dictatedNote}...
                                </div>}

                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>Active Tasks</h4>
                                    <div className="table-responsive">
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tr style={{ textAlign: 'left', background: '#f9fafb', fontSize: '0.85rem' }}>
                                                <th style={{ padding: '0.8rem' }}>Task</th>
                                                <th style={{ padding: '0.8rem' }}>Time</th>
                                                <th style={{ padding: '0.8rem' }}>Status</th>
                                            </tr>
                                            {tasks.filter(t => t.patientId === selectedPatient?.id && t.status !== 'Completed').map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                                                    <td style={{ padding: '0.8rem' }}>{t.description}</td>
                                                    <td style={{ padding: '0.8rem' }}>{t.priority}</td>
                                                    <td style={{ padding: '0.8rem' }}><span className="badge" style={{ background: '#fff7ed', color: '#c2410c' }}>{t.status}</span></td>
                                                </tr>
                                            ))}
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="card" style={{ border: '1px solid #fbbf24', background: '#fffbeb', marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#92400e', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤖 AI Care Insights</h4>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {AI_SUGGESTIONS['PATH-1234']?.alerts.map(a => (
                                            <div key={a} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                <span>🚨</span> <strong>{a}</strong>
                                            </div>
                                        )) || <p>No active AI alerts for this patient.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient Engagement Tab */}
                {activeTab === 'engagement' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3>Patient Engagement Tools</h3>

                        {/* [NEW] Patient Selector for Engagement Context */}
                        <div style={{ padding: '1.5rem', background: '#e0f2fe', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bae6fd' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#0369a1' }}>👤 Select Patient for Engagement</h4>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search by Name or Path Number..."
                                    className="input-field"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                    onChange={(e) => {
                                        // Simple local search filter could be implemented here or just rely on the main search if we want to unify.
                                        // But user asked for a specific field HERE. 
                                        // Let's rely on the main 'patients' list but filter it locally for display in this dropdown.
                                        const query = e.target.value.toLowerCase();
                                        if (!query) {
                                            // Maybe clear selection or just hide list? 
                                            // Let's just keep it simple: this updates the main search query or a local one?
                                            // Updating main searchQuery might be best to keep sync? 
                                            // User asked for a field in this tab. 
                                            setSearchQuery(query);
                                        } else {
                                            setSearchQuery(query);
                                        }
                                    }}
                                    value={searchQuery} // Sync with main search for now, or use separate? 
                                // If we share 'searchQuery', typing in top bar updates this and vice versa. That's good sync.
                                />
                                {searchQuery && patients.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        {normalizedPatients
                                            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.pathNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map(p => (
                                                <div
                                                    key={p.id}
                                                    style={{ padding: '0.8rem', borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedPatientId === p.id ? '#f0f9ff' : 'white' }}
                                                    onClick={() => {
                                                        setSelectedPatientId(p.id);
                                                        setSearchQuery(''); // Clear search after selection to show the selected state clearly? Or keep it? 
                                                        // Usually clearing is better for a "selector" feel.
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.pathNumber} • {p.age}yrs • {p.gender}</div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                            {selectedPatient && (
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                                    <span>✅ Active Patient:</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPatient.name}</span>
                                    <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid #bae6fd' }}>{selectedPatient.pathNumber}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginTop: '1.5rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem' }}>Educational Resources</h4>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>

                                    {/* [NEW] File Upload Section */}
                                    <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', marginBottom: '1rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>📤 Upload & Send File</h5>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                            <input
                                                type="file"
                                                className="input-field"
                                                style={{ padding: '0.4rem' }}
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                                onClick={handleFileUpload}
                                                disabled={!selectedFile}
                                            >
                                                <span>⬆️</span> Upload & Send
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Post-Op Care Guide (PDF)</span>
                                        <button className="btn btn-primary" style={{ fontSize: '0.7rem' }} onClick={() => handleSendResource('Post-Op Care Guide')}>Send to Patient</button>
                                    </div>
                                    <div style={{ padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Dietary Restrictions (Video)</span>
                                        <button className="btn btn-primary" style={{ fontSize: '0.7rem' }} onClick={() => handleSendResource('Dietary Restrictions')}>Send to Patient</button>
                                    </div>
                                </div>
                            </div>
                            <div className="card" style={{ background: '#f8fafc', maxHeight: '500px', overflowY: 'auto' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Patient Requests</h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {requests.length === 0 ? <p style={{ color: '#888', fontStyle: 'italic' }}>No pending requests.</p> : requests.map(req => (
                                        <div key={req.id} style={{ padding: '1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong>From: {req.from}</strong>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.time}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', margin: 0 }}>&quot;{req.message}&quot;</p>
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary" style={{ fontSize: '0.7rem' }} onClick={() => markRequestDone(req.id)}>✅ Mark as Done</button>
                                                <button className="btn btn-secondary" style={{ fontSize: '0.7rem' }}>Reply</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* [NEW] Telehealth Tab */}
                {activeTab === 'telehealth' && (
                    <div style={{ padding: '0 1rem' }}>
                        <VideoConsultation user={user} patient={selectedPatient} />
                    </div>
                )}

                {activeTab === 'discharge' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3>Discharge Checklist - {selectedPatient?.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            {[
                                'Confirm follow-up appointment scheduled',
                                'Educate patient/family on new medications',
                                'Ensure all personal belongings are collected',
                                'Obtain physician signature on discharge summary',
                                'Verify stable vitals for the last 4 hours',
                                'Remove peripheral IV / Catheters',
                                'Provide printed discharge instructions'
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                    <div style={{ flex: 1, fontSize: '0.95rem' }}>{item}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                <span style={{ color: 'var(--color-navy)', fontWeight: 'bold' }}>Progress:</span> 0 of 7 items completed
                            </div>
                            <button className="btn btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Finalize Discharge</button>
                        </div>
                    </div>
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                    <AlertsView professionalName={user.name} role={user.role} professionalId={user.id} />
                )}

                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #eee', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div
                        className="card card-hover"
                        style={{ flex: 1, background: 'linear-gradient(135deg, #1890ff, #096dd9)', color: 'white', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                        onClick={() => setActiveTab('telehealth')}
                    >
                        <div style={{ fontSize: '2rem' }}>📞</div>
                        <div>
                            <h4 style={{ margin: 0 }}>Telehealth Call</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Start a secure video session with {selectedPatient?.name || 'patient'}.</p>
                        </div>
                    </div>
                    <div
                        className="card card-hover"
                        style={{ flex: 1, background: 'linear-gradient(135deg, #722ed1, #531dab)', color: 'white', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                        onClick={() => setActiveTab('engagement')}
                    >
                        <div style={{ fontSize: '2rem' }}>📚</div>
                        <div>
                            <h4 style={{ margin: '0' }}>Education Hub</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Send diet/care guides to patient dashboard.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Profile Modal */}
            {isProfileOpen && (
                <ProfileModal
                    user={userProfile}
                    onClose={() => setIsProfileOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}

            {/* Billing Invoice Modal */}
            {invoiceData && (
                <BillingInvoiceModal
                    isOpen={invoiceData.isOpen}
                    onClose={() => setInvoiceData(null)}
                    patient={invoiceData.patient}
                    professionalName={user.name}
                    professionalRole="Nurse"
                />
            )}
        </div>
    );
}
