
import { useState, useEffect } from 'react';

export function useStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch('/api/db');
                if (res.ok) {
                    const data = await res.json();
                    if (data.users && Array.isArray(data.users)) {
                        const professionals = data.users
                            .filter(u => u.role !== 'admin' && u.role !== 'patient')
                            .map(u => ({
                                ...u,
                                expertise: u.specialization || 'General',
                                category: u.specialization || u.category || u.role || 'Staff',
                                facility: u.currentFacility || u.facility || 'Main Hospital'
                            }));
                        setStaff(professionals);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch staff", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    return { staff, loading };
}
