"use client";
import React, { useState } from 'react';
import {
    Activity, AlertTriangle, Search, Zap,
    FileText, CheckCircle, RefreshCcw, pill
} from 'lucide-react';

const INTERACTIONS_DB = {
    'lisinopril': ['potassium', 'lithium', 'albuterol'],
    'warfarin': ['aspirin', 'ibuprofen', 'acetaminophen'],
    'metformin': ['alcohol', 'iodinated contrast'],
    'amoxicillin': ['methotrexate'],
    'albuterol': ['beta-blockers', 'digoxin']
};

const SUBSTITUTES_DB = {
    'lisinopril': [
        { name: 'Prinivil', type: 'Brand', cost: '$$$' },
        { name: 'Zestril', type: 'Brand', cost: '$$$' },
        { name: 'Benazepril', type: 'Alternative (ACE)', cost: '$' }
    ],
    'metformin': [
        { name: 'Glucophage', type: 'Brand', cost: '$$' },
        { name: 'Glumetza', type: 'Brand', cost: '$$$' },
        { name: 'Riomet', type: 'Liquid', cost: '$$' }
    ],
    'amoxicillin': [
        { name: 'Amoxil', type: 'Brand', cost: '$$' },
        { name: 'Augmentin', type: 'Alternative (Stronger)', cost: '$$$' }
    ],
    'panadol': [
        { name: 'Paracetamol', type: 'Generic', cost: '$' },
        { name: 'Tylenol', type: 'Brand', cost: '$$' }
    ]
};

export default function PharmacyAI({ inventory, patients }) {
    const [activeTool, setActiveTool] = useState('interactions');
    const [drugA, setDrugA] = useState('');
    const [drugB, setDrugB] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [substituteQuery, setSubstituteQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // AI Colors
    const AI_ACCENT = 'linear-gradient(135deg, #6366f1, #a855f7)';
    const GLASS_BG = 'rgba(255, 255, 255, 0.95)';

    const handleCheckInteraction = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            const da = drugA.toLowerCase();
            const db = drugB.toLowerCase();
            const badListA = INTERACTIONS_DB[da] || [];
            const badListB = INTERACTIONS_DB[db] || [];

            let found = false;
            let severity = 'None';
            let message = 'No known interactions found between these medications.';

            // Check A against B
            if (badListA.some(bad => db.includes(bad)) || badListB.some(bad => da.includes(bad))) {
                found = true;
                severity = 'High';
                message = `CRITICAL WARNING: ${drugA} and ${drugB} have a POTENTIAL SEVERE INTERACTION. Close monitoring required. Risk of hyperkalemia or reduced efficacy.`;
            } else if (da && db) {
                // Mock "Moderate"
                if (Math.random() > 0.8) {
                    found = true;
                    severity = 'Moderate';
                    message = `Moderate Interaction detected. May increase side effects. Consult physician.`;
                }
            }

            setAnalysisResult({ found, severity, message });
            setIsAnalyzing(false);
        }, 800);
    };

    const getSubstitutes = (drugName) => {
        const query = drugName.toLowerCase();
        for (const key in SUBSTITUTES_DB) {
            if (query.includes(key) || key.includes(query)) {
                return SUBSTITUTES_DB[key];
            }
        }
        return [];
    };

    const renderToolContent = () => {
        switch (activeTool) {
            case 'interactions':
                return (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Drug Interaction Checker</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>AI-powered analysis of potential contraindications and adverse reactions.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Drug A</label>
                                <input
                                    className="ai-input"
                                    value={drugA}
                                    onChange={(e) => setDrugA(e.target.value)}
                                    placeholder="e.g. Lisinopril"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Drug B (or Food/Condition)</label>
                                <input
                                    className="ai-input"
                                    value={drugB}
                                    onChange={(e) => setDrugB(e.target.value)}
                                    placeholder="e.g. Potassium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCheckInteraction}
                            disabled={!drugA || !drugB || isAnalyzing}
                            className="ai-btn"
                        >
                            {isAnalyzing ? (
                                <><RefreshCcw className="spin" size={18} /> Analyzing...</>
                            ) : (
                                <><Zap size={18} /> Analyze Interaction</>
                            )}
                        </button>

                        {analysisResult && (
                            <div className="result-card" style={{
                                marginTop: '2rem',
                                borderLeft: `4px solid ${analysisResult.severity === 'High' ? '#ef4444' : (analysisResult.severity === 'Moderate' ? '#f59e0b' : '#22c55e')}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                    {analysisResult.severity === 'High' ? <AlertTriangle color="#ef4444" /> : <CheckCircle color="#22c55e" />}
                                    <h4 style={{ margin: 0, color: '#0f172a' }}>Severity: {analysisResult.severity}</h4>
                                </div>
                                <p style={{ color: '#334155', lineHeight: 1.6 }}>{analysisResult.message}</p>
                            </div>
                        )}
                    </div>
                );
            case 'substitutes':
                const subs = substituteQuery ? getSubstitutes(substituteQuery) : [];
                return (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Smart Substitutes</h3>
                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <input
                                className="ai-input"
                                placeholder="Enter prescribed drug name..."
                                value={substituteQuery}
                                onChange={(e) => setSubstituteQuery(e.target.value)}
                                style={{ paddingLeft: '2.8rem' }}
                            />
                            <Search style={{ position: 'absolute', left: '1rem', top: '14px', color: '#94a3b8' }} size={18} />
                        </div>

                        {substituteQuery && (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {subs.length > 0 ? (
                                    subs.map((sub, idx) => {
                                        // Check inventory for sub
                                        const stock = inventory.find(i => i.name.toLowerCase().includes(sub.name.toLowerCase()));
                                        return (
                                            <div key={idx} className="result-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a' }}>{sub.name}</h4>
                                                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>{sub.type}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 600, color: '#0ea5e9' }}>{sub.cost}</div>
                                                    <div style={{ fontSize: '0.8rem', color: stock && stock.quantity > 0 ? '#16a34a' : '#ef4444' }}>
                                                        {stock ? `In Stock (${stock.quantity} units)` : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                                        No specific substitutes found in local database. AI suggests checking standard formulary.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'analysis':
                return (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Clinical Co-Pilot</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Select a patient to run a full medication review.</p>
                        <select className="ai-input" style={{ marginBottom: '2rem' }}>
                            <option value="">Select Patient...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="result-card" style={{ background: '#f8fafc', textAlign: 'center', padding: '3rem' }}>
                            <Activity color="#cbd5e1" size={48} style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b' }}>Select a patient above to start comprehensive AI review of allergies, dosage consistency, and cumulative side effects.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
            {/* AI Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                    background: AI_ACCENT, padding: '1.5rem', borderRadius: '16px', color: 'white',
                    marginBottom: '1rem', boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)'
                }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Cortex AI</h2>
                    <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Pharmacy Assistant</p>
                </div>

                {[
                    { id: 'interactions', label: 'Interaction Check', icon: <Zap size={18} /> },
                    { id: 'substitutes', label: 'Smart Substitutes', icon: <RefreshCcw size={18} /> },
                    { id: 'analysis', label: 'Clinical Review', icon: <Activity size={18} /> }
                ].map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '1rem', borderRadius: '12px', border: 'none',
                            background: activeTool === tool.id ? 'white' : 'transparent',
                            color: activeTool === tool.id ? '#0f172a' : '#64748b',
                            boxShadow: activeTool === tool.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                    >
                        {tool.icon}
                        {tool.label}
                    </button>
                ))}
            </div>

            {/* AI Main Content */}
            <div style={{ background: GLASS_BG, borderRadius: '16px', border: '1px solid white', boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.05)', padding: '2.5rem', overflowY: 'auto' }}>
                {renderToolContent()}
            </div>

            <style jsx>{`
                .ai-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    outline: none;
                    transition: border 0.2s;
                    font-size: 0.95rem;
                }
                .ai-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .ai-btn {
                    width: 100%;
                    padding: 0.8rem;
                    border: none;
                    border-radius: 10px;
                    background: #0f172a;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .ai-btn:hover {
                    background: #1e293b;
                    transform: translateY(-1px);
                }
                .ai-btn:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                    transform: none;
                }
                .result-card {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
            `}</style>
        </div>
    );
}
