import ChannelCard from '../../components/channel/ChannelCard';

const MOCK_INSTRUCTOR_CHANNELS = [
    {
        id: 1,
        title: 'Advanced React Development',
        postCount: 15,
        lastActivity: '2 hours ago'
    },
    {
        id: 2,
        title: 'UI/UX Design Masterclass',
        postCount: 8,
        lastActivity: 'Yesterday'
    },
    {
        id: 3,
        title: 'Full Stack Web Development',
        postCount: 0,
        lastActivity: '3 days ago'
    }
];

const InstructorChannelsPage = () => {
    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Course Channels</h1>
                <p style={{ color: '#64748b' }}>Manage communication for your active courses.</p>
            </div>

            {MOCK_INSTRUCTOR_CHANNELS.length > 0 ? (
                <div className="channel-grid">
                    {MOCK_INSTRUCTOR_CHANNELS.map((channel) => (
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
