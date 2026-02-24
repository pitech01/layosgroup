import ChannelCard from '../../components/channel/ChannelCard';

const MOCK_STUDENT_CHANNELS = [
    {
        id: 1,
        title: 'Advanced React Development',
        instructor: 'Sarah Wilson',
        lastActivity: '2 hours ago'
    },
    {
        id: 2,
        title: 'UI/UX Design Masterclass',
        instructor: 'Michael Chen',
        lastActivity: 'Yesterday'
    }
];

const StudentChannelsPage = () => {
    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Course Channels</h1>
                <p style={{ color: '#64748b' }}>Stay connected with your instructors and classmates.</p>
            </div>

            {MOCK_STUDENT_CHANNELS.length > 0 ? (
                <div className="channel-grid">
                    {MOCK_STUDENT_CHANNELS.map((channel) => (
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
