"use client";
import React, { useState, useEffect } from 'react';
import {
    Server, Wifi, Shield, Truck, Activity, MessageSquare,
    CheckCircle, XCircle, RefreshCw, Settings, Power
} from 'lucide-react';

export default function PharmacyIntegrations() {
    const [integrations, setIntegrations] = useState([
        {
            id: 'ehr-core',
            name: 'Hospital EHR Core',
            description: 'Syncs patient profiles and clinical notes.',
            icon: <Server size={24} color="#3b82f6" />,
            status: 'Connected',
            latency: '12ms',
            lastSync: 'Just now',
            enabled: true
        },
        {
            id: 'insurance-gateway',
            name: 'MediClaim Pro Gateway',
            description: 'Real-time coverage verification & billing.',
            icon: <Shield size={24} color="#8b5cf6" />,
            status: 'Connected',
            latency: '45ms',
            lastSync: '5 mins ago',
            enabled: true
        },
        {
            id: 'supply-chain',
            name: 'PharmaWholesale Global',
            description: 'Automated restocking and inventory updates.',
            icon: <Truck size={24} color="#f59e0b" />,
            status: 'Idle',
            latency: '-',
            lastSync: '2 hours ago',
            enabled: true
        },
        {
            id: 'regulatory',
            name: 'FDA/MoH Direct',
            description: 'Controlled substance reporting portal.',
            icon: <Activity size={24} color="#ef4444" />,
            status: 'Connected',
            latency: '230ms',
            lastSync: 'Yesterday',
            enabled: true
        },
        {
            id: 'iot-environment',
            name: 'SenseTemp Cloud (IoT)',
            description: 'Fridge temperature sensor stream.',
            icon: <Wifi size={24} color="#10b981" />,
            status: 'Connected',
            latency: '45ms',
            lastSync: 'Live',
            enabled: true
        },
        {
            id: 'comms-gateway',
            name: 'Patient Alerts (Twilio)',
            description: 'SMS and WhatsApp notification delivery.',
            icon: <MessageSquare size={24} color="#ec4899" />,
            status: 'Rate Limited',
            latency: '80ms',
            lastSync: '10 mins ago',
            enabled: true
        }
    ]);

    const [logs, setLogs] = useState([
        { time: '09:21:05', system: 'IoT', message: 'Temperature data packet received (4.2°C)' },
        { time: '09:20:55', system: 'EHR', message: 'Patient profile (ID: P-992) updated' },
        { time: '09:18:22', system: 'Insurance', message: 'Claim #4491 approved' },
        { time: '09:15:00', system: 'System', message: 'Health check passed (6/6 services)' }
    ]);

    const toggleIntegration = (id) => {
        setIntegrations(prev => prev.map(int => {
            if (int.id === id) {
                const newStatus = !int.enabled;
                addLog('System', `${int.name} ${newStatus ? 'enabled' : 'disabled'} by user`);
                return { ...int, enabled: newStatus, status: newStatus ? 'Initializing...' : 'Disabled' };
            }
            return int;
        }));

        // Simulate reconnection
        const target = integrations.find(i => i.id === id);
        if (target && !target.enabled) {
            setTimeout(() => {
                setIntegrations(prev => prev.map(int =>
                    int.id === id ? { ...int, status: 'Connected' } : int
                ));
            }, 2000);
        }
    };

    const addLog = (system, message) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [{ time, system, message }, ...prev].slice(0, 10));
    };

    const handleSync = (id) => {
        const target = integrations.find(i => i.id === id);
        if (!target.enabled) return;

        setIntegrations(prev => prev.map(int =>
            int.id === id ? { ...int, status: 'Syncing...' } : int
        ));

        addLog(target.name, `Manual sync started...`);

        setTimeout(() => {
            setIntegrations(prev => prev.map(int =>
                int.id === id ? { ...int, status: 'Connected', lastSync: 'Just now' } : int
            ));
            addLog(target.name, `Sync completed successfully.`);
        }, 1500);
    };

    return (
        <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '2rem' }}>

            {/* Header */}
            <div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>System Integrations</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Manage external connections, APIs, and data streams.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', height: '100%', overflow: 'hidden' }}>

                {/* Integration Grid */}
                <div style={{ overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
                    {integrations.map(int => (
                        <div key={int.id} className="integration-card" style={{ opacity: int.enabled ? 1 : 0.7 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                                    {int.icon}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => handleSync(int.id)}
                                        className="icon-btn"
                                        title="Force Sync"
                                        disabled={!int.enabled}
                                    >
                                        <RefreshCw size={18} className={int.status === 'Syncing...' ? 'spin' : ''} />
                                    </button>
                                    <button className="icon-btn" title="Settings">
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={() => toggleIntegration(int.id)}
                                        className="icon-btn"
                                        style={{ color: int.enabled ? '#ef4444' : '#64748b' }}
                                        title={int.enabled ? 'Disable' : 'Enable'}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{int.name}</h3>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b', minHeight: '40px' }}>{int.description}</p>

                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.8rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#64748b' }}>Status</span>
                                    <span style={{
                                        fontWeight: 600,
                                        color: int.status === 'Connected' ? '#16a34a' : (int.status === 'Disabled' ? '#94a3b8' : '#eab308')
                                    }}>
                                        {int.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#64748b' }}>Latency</span>
                                    <span style={{ fontFamily: 'monospace' }}>{int.latency}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Sync</span>
                                    <span>{int.lastSync}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Terminal / Logs */}
                <div className="terminal-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.8rem' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} color="#22c55e" /> Live Transaction Stream
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{logs.length} events</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', maxHeight: 'calc(100% - 60px)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', animation: 'fadeIn 0.3s' }}>
                                <span style={{ color: '#64748b' }}>[{log.time}]</span>
                                <span style={{ color: '#38bdf8', minWidth: '70px' }}>{log.system}</span>
                                <span style={{ color: '#e2e8f0' }}>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <style jsx>{`
                .integration-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .integration-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                .terminal-card {
                    background: #0f172a;
                    border-radius: 12px;
                    padding: 1.5rem;
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    height: 100%;
                }
                .icon-btn {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: #94a3b8;
                    transition: color 0.2s;
                    border-radius: 4px;
                }
                .icon-btn:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-5px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
