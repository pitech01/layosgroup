import { useState, useEffect } from 'react';
import ChannelCard from '../../components/channel/ChannelCard';
import { Loader2 } from 'lucide-react';

const InstructorChannelsPage = () => {
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                const response = await fetch(`${API_URL}/cohorts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const cohorts = await response.json();

                    const coursesMap = new Map();
                    cohorts.forEach((cohort: any) => {
                        if (cohort.course) {
                            if (!coursesMap.has(cohort.course.id)) {
                                coursesMap.set(cohort.course.id, {
                                    id: cohort.course.id,
                                    title: cohort.course.title,
                                    postCount: 0,
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
            <style>{`
                .channel-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                @media (max-width: 640px) {
                    .channel-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .channels-header-section {
                        text-align: center;
                    }
                    .channels-header-section h1 {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>

            <div className="channels-header-section" style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Course Channels</h1>
                <p style={{ color: '#64748b' }}>Manage communication for your active courses.</p>
            </div>

            {channels.length > 0 ? (
                <div className="channel-grid">
                    {channels.map((channel) => (
                        <ChannelCard
                            key={channel.id}
                            courseId={channel.id}
                            courseTitle={channel.title}
                            postCount={channel.postCount}
                            lastActivity={channel.lastActivity}
                            basePath="/instructor"
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-channel-state">
                    <h3 style={{ fontWeight: 800, color: '#0f172a' }}>You have no active course channels yet.</h3>
                </div>
            )}
        </div>
    );
};

export default InstructorChannelsPage;
