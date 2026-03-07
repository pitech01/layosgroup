import { useState, useEffect } from 'react';
import ChannelCard from '../../components/channel/ChannelCard';
import { Loader2 } from 'lucide-react';

const StudentChannelsPage = () => {
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const cohorts = data.cohorts || [];

                    const coursesMap = new Map();
                    cohorts.forEach((cohort: any) => {
                        if (cohort.course) {
                            if (!coursesMap.has(cohort.course.id)) {
                                coursesMap.set(cohort.course.id, {
                                    id: cohort.course.id,
                                    title: cohort.course.title,
                                    instructor: cohort.course.instructor?.name || 'Instructor',
                                    lastActivity: 'Active'
                                });
                            }
                        }
                    });

                    setChannels(Array.from(coursesMap.values()));
                }
            } catch (error) {
                console.error("Failed to fetch channels", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Course Channels</h1>
                <p style={{ color: '#64748b' }}>Stay connected with your instructors and classmates.</p>
            </div>

            {channels.length > 0 ? (
                <div className="channel-grid">
                    {channels.map((channel) => (
                        <ChannelCard
                            key={channel.id}
                            courseId={channel.id}
                            courseTitle={channel.title}
                            instructorName={channel.instructor}
                            lastActivity={channel.lastActivity}
                            basePath="/student"
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-channel-state">
                    <h3 style={{ fontWeight: 800, color: '#0f172a' }}>You are not enrolled in any courses yet.</h3>
                </div>
            )}
        </div>
    );
};

export default StudentChannelsPage;
