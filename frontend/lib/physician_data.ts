export interface PhysicianTab {
    id: string;
    name: string;
    icon: string;
}

export const PHYSICIAN_TABS: PhysicianTab[] = [
    { id: 'smart-list', name: 'Smart Patient List', icon: '📋' },
    { id: 'charthub', name: 'ChartHub', icon: '📂' },
    { id: 'patient-records', name: 'Patient Records', icon: '🗂️' },
    { id: 'telehealth', name: 'Telehealth & Remote', icon: '📞' },
    { id: 'action-center', name: 'Action Center', icon: '📋' },
    { id: 'analytics', name: 'Analytics & Insights', icon: '📊' },
    { id: 'communication', name: 'Communication Hub', icon: '📨' },
    { id: 'collaboration', name: 'Collaboration', icon: '👨‍⚕️' },
    { id: 'tasks', name: 'Tasks & Follow-Ups', icon: '⏰' },
    { id: 'engagement', name: 'Patient Engagement', icon: '📱' },
    { id: 'alerts', name: 'Alerts 🔔', icon: '🔔' }
];

export const MOCK_PATIENTS = [];
export const AI_SUGGESTIONS = {};
export const CLINICAL_ALERTS = [];
