"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoConsultation from '@/components/VideoConsultation';
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
        <VideoConsultation
            patientId={params.id} // This is the ID of the person we are calling OR the session ID. 
            // In a real app, 'id' might be appointment ID.
            // For now, based on dashboard link, it's the Patient ID or Professional ID.
            user={user}
        />
    );
}
