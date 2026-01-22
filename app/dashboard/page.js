"use client";
import { useAuth } from '@/components/AuthProvider';
import { ROLES } from '@/lib/auth_constants';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientDashboard from '@/components/PatientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import ProfessionalDashboard from '@/components/ProfessionalDashboard';

import { SecureStorage } from '@/lib/secure_storage';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Protect the route
    useEffect(() => {
        // Check if session exists in Secure Storage
        const storedUser = SecureStorage.getItem('dr_kal_user');

        // console.log("Dashboard Check - User:", user, "Stored:", storedUser);
        if (!storedUser && !user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return <div className="container" style={{ paddingTop: '2rem' }}>Loading Dashboard...</div>;
    }

    // console.log("Rendering Dashboard for Role:", user.role);

    // Render based on role
    if (user.role === ROLES.ADMIN) return <AdminDashboard user={user} />;
    if (user.role === ROLES.DOCTOR ||
        user.role === ROLES.SCIENTIST ||
        user.role === ROLES.PHARMACIST ||
        user.role === ROLES.NURSE ||
        user.role === ROLES.DIETICIAN ||
        user.role === ROLES.PSYCHOLOGIST) {
        return <ProfessionalDashboard user={user} />;
    }

    // Default to patient
    return <PatientDashboard user={user} />;
}
