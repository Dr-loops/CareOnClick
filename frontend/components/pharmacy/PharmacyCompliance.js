"use client";
import React, { useState } from 'react';
import {
    ShieldCheck, Thermometer, AlertOctagon, FileText,
    Trash2, ClipboardList, CheckCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';

// Mock Data for Charts
const TEMPERATURE_DATA = [
    { time: '08:00', temp: 4.2 }, { time: '09:00', temp: 4.5 },
    { time: '10:00', temp: 4.8 }, { time: '11:00', temp: 5.1 },
    { time: '12:00', temp: 5.5 }, { time: '13:00', temp: 5.2 },
    { time: '14:00', temp: 4.9 }, { time: '15:00', temp: 4.6 },
    { time: '16:00', temp: 4.4 }, { time: '17:00', temp: 4.3 },
    { time: '18:00', temp: 4.1 }, { time: '19:00', temp: 4.0 },
];

const ADHERENCE_DATA = [
    { month: 'Jan', rate: 88, target: 90 },
    { month: 'Feb', rate: 86, target: 90 },
    { month: 'Mar', rate: 89, target: 90 },
    { month: 'Apr', rate: 92, target: 90 },
    { month: 'May', rate: 91, target: 90 },
    { month: 'Jun', rate: 94, target: 90 },
];

const DEFAULT_LOGS = [
    { id: 1, date: '2024-10-24', drug: 'Morphine Sulfate 15mg', qty: 30, patient: 'John Doe', prescriber: 'CareOnClick', pharmacist: 'Jane P.', type: 'Dispense' },
    { id: 2, date: '2024-10-25', drug: 'Oxycodone 5mg', qty: 60, patient: 'Alice Smith', prescriber: 'Dr. House', pharmacist: 'Jane P.', type: 'Dispense' },
    { id: 3, date: '2024-10-26', drug: 'Methylphenidate 10mg', qty: 100, patient: 'Pharmacy Stock', prescriber: 'N/A', pharmacist: 'System', type: 'Restock' },
];

export default function PharmacyCompliance() {
    const [activeSection, setActiveSection] = useState('overview');

    // [NEW] Persistent Logs State
    const [logs, setLogs] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // [NEW] Modal State
    const [showModal, setShowModal] = useState(false);
    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        drug: '',
        type: 'Dispense',
        qty: '',
        patient: '',
        prescriber: '',
        pharmacist: ''
    });

    // Load from LocalStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pharmacy_compliance_logs');
            if (saved) {
                setLogs(JSON.parse(saved));
            } else {
                setLogs(DEFAULT_LOGS);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save to LocalStorage
    React.useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('pharmacy_compliance_logs', JSON.stringify(logs));
        }
    }, [logs, isLoaded]);

    const handleSaveEntry = () => {
        if (!newEntry.drug || !newEntry.qty || !newEntry.pharmacist) {
            alert("Please fill in Drug, Quantity, and Pharmacist signature.");
            return;
        }

        const entry = {
            id: Date.now(),
            ...newEntry
        };

        setLogs([entry, ...logs]);
        setShowModal(false);
        setNewEntry({
            date: new Date().toISOString().split('T')[0],
            drug: '',
            type: 'Dispense',
            qty: '',
            patient: '',
            prescriber: '',
            pharmacist: ''
        });
        alert("Entry Logged Successfully");
    };

    const renderOverview = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Scorecard */}
            <div className="compliance-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>98/100</h3>
                        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Audit Readiness Score</p>
                    </div>
                    <ShieldCheck size={48} opacity={0.8} />
                </div>
                <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <CheckCircle size={16} /> All Licenses Active
                    </div>
                </div>
            </div>

            {/* Environmental Snapshot */}
            <div className="compliance-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Fridge Monitoring</h3>
                    <Thermometer color="#0ea5e9" />
                </div>
                <div style={{ height: '150px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TEMPERATURE_DATA}>
                            <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                    Current: 4.0°C (Optimal)
                </div>
            </div>

            {/* Pending Actions */}
            <div className="compliance-card">
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Action Required</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ background: '#fff1f2', borderLeft: '4px solid #f43f5e', padding: '0.8rem', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 600, color: '#9f1239' }}>Schedule II Audit Due</div>
                        <div style={{ fontSize: '0.8rem', color: '#be123c' }}>Due in 3 days</div>
                    </div>
                    <div style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '0.8rem', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 600, color: '#9a3412' }}>Disposal Log Review</div>
                        <div style={{ fontSize: '0.8rem', color: '#c2410c' }}>Pending Sign-off</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="compliance-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertOctagon color="#ef4444" size={20} />
                    Controlled Substance Log (CII - CV)
                </h3>
                <button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => setShowModal(true)}
                >
                    + New Entry
                </button>
            </div>

            {/* Log Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Drug & Strength</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Patient/Source</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Pharmacist</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', color: '#334155' }}>{log.date}</td>
                            <td style={{ padding: '1rem', fontWeight: 500 }}>{log.drug}</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    background: log.type === 'Dispense' ? '#fff1f2' : (log.type === 'Restock' ? '#f0fdf4' : '#fefce8'),
                                    color: log.type === 'Dispense' ? '#e11d48' : (log.type === 'Restock' ? '#16a34a' : '#ca8a04'),
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                                }}>{log.type}</span>
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.qty}</td>
                            <td style={{ padding: '1rem', color: '#64748b' }}>{log.patient}</td>
                            <td style={{ padding: '1rem', color: '#64748b' }}>{log.pharmacist}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderInsights = () => (
        <div className="compliance-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Adherence & Operational Analytics</h3>
            <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ADHERENCE_DATA}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} domain={[60, 100]} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="rate" stroke="#8884d8" fillOpacity={1} fill="url(#colorRate)" name="Adherence Rate %" />
                        <Area type="monotone" dataKey="target" stroke="#82ca9d" fill="none" strokeDasharray="5 5" name="Target (90%)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button onClick={() => setActiveSection('overview')} className={`tab-link ${activeSection === 'overview' ? 'active' : ''}`}>Overview</button>
                    <button onClick={() => setActiveSection('logs')} className={`tab-link ${activeSection === 'logs' ? 'active' : ''}`}>Controlled Logs</button>
                    <button onClick={() => setActiveSection('insights')} className={`tab-link ${activeSection === 'insights' ? 'active' : ''}`}>Analytics</button>
                </div>
            </div>

            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'logs' && renderLogs()}
            {activeSection === 'insights' && renderInsights()}

            {/* New Entry Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="compliance-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>New Controlled Substance Entry</h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Date</label>
                                <input type="date" className="input" value={newEntry.date} onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Drug Name & Strength</label>
                                <input type="text" className="input" placeholder="e.g. Morphine 15mg" value={newEntry.drug} onChange={e => setNewEntry(p => ({ ...p, drug: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Type</label>
                                    <select className="input" value={newEntry.type} onChange={e => setNewEntry(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <option value="Dispense">Dispense</option>
                                        <option value="Restock">Restock</option>
                                        <option value="Waste">Waste/Disposal</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Quantity</label>
                                    <input type="number" className="input" placeholder="e.g. 30" value={newEntry.qty} onChange={e => setNewEntry(p => ({ ...p, qty: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Patient Name / Source</label>
                                <input type="text" className="input" placeholder="Patient Name or Wholesaler" value={newEntry.patient} onChange={e => setNewEntry(p => ({ ...p, patient: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Prescriber</label>
                                <input type="text" className="input" placeholder="Dr. Name (if dispense)" value={newEntry.prescriber} onChange={e => setNewEntry(p => ({ ...p, prescriber: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Pharmacist Signature</label>
                                <input type="text" className="input" placeholder="Your Initials/Name" value={newEntry.pharmacist} onChange={e => setNewEntry(p => ({ ...p, pharmacist: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEntry} style={{ padding: '0.6rem 1.2rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Entry</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .compliance-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .tab-link {
                    background: none;
                    border: none;
                    padding-bottom: 0.5rem;
                    font-size: 1rem;
                    color: #64748b;
                    cursor: pointer;
                    font-weight: 500;
                    position: relative;
                }
                .tab-link.active {
                    color: #0f172a;
                    font-weight: 600;
                }
                .tab-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: -0.6rem;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #0f172a;
                }
            `}</style>
        </div>
    );
}
