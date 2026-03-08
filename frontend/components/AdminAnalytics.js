"use client";
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer as ResponsiveContainer2
} from 'recharts';

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--color-grey-500)' }}>
            <div className="animate-pulse">Loading Hospital Insights...</div>
        </div>
    );

    if (!data) return (
        <div className="alert-error">Failed to load analytics data.</div>
    );

    return (
        <div className="analytics-dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ color: 'var(--color-navy)', margin: 0 }}>Hospital Analytics & Insights</h2>
                    <p style={{ color: 'var(--color-grey-500)', marginTop: '0.25rem' }}>Real-time metrics from electronic health records and patient demographics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Last Updated</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Patients</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{data?.totalStats?.patients || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>↑ Active Records</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Avg. Heart Rate</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{data?.vitals?.avgHr || 0} <span style={{ fontSize: '1rem' }}>BPM</span></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Hospital Avg</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Avg. SPO2</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{data?.vitals?.avgSpo2 || 0}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Normal Range</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Recent Records</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{data?.totalStats?.records || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clinical Consultations</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>

                {/* Top Diagnoses */}
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        🩺 Prevalent Conditions (Top 5)
                    </h4>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data?.topDiagnoses || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Prescriptions */}
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        💊 Most Prescribed Medications
                    </h4>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data?.topPrescriptions || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Region Distribution */}
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        🌍 Regional Demographics
                    </h4>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data?.demographics?.regions || []}
                                    cx="50%" cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(data?.demographics?.regions || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Age Range Distribution */}
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        👥 Age Group Distribution
                    </h4>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data?.demographics?.age || []}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {(data?.demographics?.age || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAnalytics;
