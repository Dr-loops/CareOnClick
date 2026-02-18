export const PHARMACY_TABS = [
    { id: 'inbox', name: 'Smart Inbox', icon: '📬' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'patients', name: 'Patient Profiles', icon: '👤' },
    { id: 'patient-records', name: 'Patient Records', icon: '🗂️' },
    { id: 'telepharmacy', name: 'Telepharmacy Hub', icon: '📞' },
    { id: 'collaboration', name: 'Collaboration', icon: '👨‍⚕️' },
    { id: 'support', name: 'AI Support', icon: '🤖' },
    { id: 'compliance', name: 'Compliance & Insights', icon: '📊' },
    { id: 'integrations', name: 'Integrations', icon: '🔄' },
    { id: 'communication', name: 'Communication Hub', icon: '📨' },
    { id: 'action-center', name: 'Action Center', icon: '📋' },
    { id: 'engagement', name: 'Patient Engagement', icon: '📱' },
    { id: 'alerts', name: 'Alerts 🔔', icon: '🔔' }
];

export const MOCK_PHARMACY_DATA = {
    prescriptions: [],
    inventory: [],
    analytics: {
        avgAdherence: 0,
        dispensedToday: 0,
        pendingSyncs: 0,
        adherenceTrend: []
    }
};
