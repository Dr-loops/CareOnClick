"use client";
import React, { useState, useEffect } from 'react';

export default function BillingInvoiceModal({ isOpen, onClose, patient, professionalName, professionalRole }) {
    // Hooks must be called unconditionally
    const [items, setItems] = useState([]);
    const [invoiceId] = useState(`INV-${Math.floor(Math.random() * 90000) + 10000}`);
    const [date] = useState(new Date().toLocaleDateString());

    useEffect(() => {
        if (!isOpen || !patient) return;
        // Generate relevant billing items based on context or mock real service data
        // In a real app, this would fetch from /api/appointments?patientId=...
        const baseItems = [
            { desc: `${professionalRole} Consultation`, amount: getBaseFee(professionalRole) },
            { desc: 'Administrative & Service Charge', amount: 15 }
        ];

        // Add random extras based on role for realism
        if (professionalRole === 'Physician') baseItems.push({ desc: 'General Vitals Check', amount: 50 });
        if (professionalRole === 'Pharmacist') baseItems.push({ desc: 'Medication Dispensing Fee', amount: 25 });
        if (professionalRole === 'Lab Scientist') baseItems.push({ desc: 'Sample Collection Kit', amount: 30 });

        setItems(baseItems);
    }, [patient, professionalRole, isOpen]);

    if (!isOpen || !patient) return null;

    const getBaseFee = (role) => {
        const fees = {
            'Physician': 400,
            'doctor': 400,
            'Scientist': 250,
            'Nurse': 200,
            'Dietician': 200,
            'Pharmacist': 250,
            'Psychologist': 250
        };
        return fees[role] || 150;
    };

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const handlePrint = () => {
        // 1. Log to Audit Trail
        if (typeof window !== 'undefined') {
            const logs = JSON.parse(localStorage.getItem('dr_kal_audit_logs') || '[]');
            logs.push({
                timestamp: new Date().toISOString(),
                action: 'INVOICE_PRINTED',
                actorName: professionalName,
                targetName: patient.name,
                details: `Printed Invoice #${invoiceId} (Amt: GHS ${total})`,
                notes: `Role: ${professionalRole}`,
                id: Date.now()
            });
            localStorage.setItem('dr_kal_audit_logs', JSON.stringify(logs));
        }

        // 2. Trigger Print
        window.print();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 9999, overflowY: 'auto', padding: '40px 20px'
        }} className="no-print-overlay">
            <style jsx global>{`
                @media print {
                    .no-print-overlay { position: static !important; background: none !important; display: block !important; height: auto !important; width: 100% !important; padding: 0 !important; }
                    .invoice-modal { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
                    .no-print-btn { display: none !important; }
                    body > *:not(.no-print-overlay) { display: none !important; }
                }
            `}</style>

            <div className="invoice-modal" style={{
                background: 'white', width: '800px', maxWidth: '100%',
                padding: '40px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 'fit-content'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/logo_new.jpg" alt="Hospital Logo" style={{ height: '60px', width: 'auto' }} />
                        <div>
                            <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.8rem' }}>CAREONCLICK</h1>
                            <p style={{ margin: '5px 0 0', color: '#64748b' }}>Excellence in Digital Healthcare</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>INVOICE</h2>
                        <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>#{invoiceId}</p>
                        <p style={{ margin: 0 }}>Date: {date}</p>
                    </div>
                </div>

                {/* Patient & Provider Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', margin: '10px 0' }}>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Bill To</h3>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{patient.name}</div>
                        <div>ID: {patient.pathNumber || patient.id || 'N/A'}</div>
                        <div>{patient.email}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Issued By</h3>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{professionalName}</div>
                        <div>Role: {professionalRole}</div>
                        <div>Facility: Virtual Hospital Main</div>
                    </div>
                </div>

                {/* Line Items */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#1e3a8a', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Amount (GHS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px' }}>{item.desc}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span>Subtotal:</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                            <span>Total Due:</span>
                            <span>GHS {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                    <div style={{ marginBottom: '15px', color: '#1e3a8a' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>PAYMENT ACCOUNTS</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', fontSize: '0.8rem' }}>
                            <span><strong>CALBANK:</strong> 140000606093 (JULIUS KALETSI)</span>
                            <span><strong>MTN MOMO:</strong> 0559117904 (JULIUS KALETSI)</span>
                            <span><strong>TELECEL CASH:</strong> 0200670575 (JULIUS KALETSI)</span>
                        </div>
                    </div>
                    <p>Thank you for choosing CareOnClick. Payment is due upon receipt.</p>
                    <p>Contact Support: drkalsvirtualhospital@gmail.com | +233 595 441 825</p>
                </div>

                {/* Action Buttons */}
                <div className="no-print-btn" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        🖨️ Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
