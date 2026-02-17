"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import VideoConsultation from '@/components/VideoConsultation'; // Decommissioned
import { useAuth } from '@/components/AuthProvider';

export default function ConsultationPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth(); // Assuming useAuth exists and works client-side or we fetch session

    // Fallback if useAuth is not perfect, we can fetch /api/auth/session or similar.
    // But let's assume useAuth works as per previous context.

    if (loading) return <div>Loading...</div>;
    if (!user) {
        // Redirect if not logged in
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Video Consultation Upgrade</h1>
                <p>The legacy video system has been decommissioned.</p>
                <p>Please use the Google Meet or WhatsApp options from the dashboard.</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-6 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
