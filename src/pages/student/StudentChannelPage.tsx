import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ChannelHeader from '../../components/channel/ChannelHeader';
import ChannelFeed from '../../components/channel/ChannelFeed';
import type { Message } from '../../components/channel/MessageCard';

const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        senderName: 'Sarah Wilson',
        senderRole: 'instructor',
        type: 'announcement',
        content: 'Welcome to the Course Channel! Here I will share all important updates and assignments.',
        createdAt: 'Feb 15, 2024',
        attachmentUrl: '#'
    },
    {
        id: '4',
        senderName: 'Sarah Wilson',
        senderRole: 'instructor',
        type: 'assignment',
        content: 'Please submit your React Portfolio project by next Monday. Ensure you have at least 3 pages implemented.',
        dueDate: 'Feb 26, 2024',
        createdAt: 'Feb 20, 2024',
        attachmentUrl: '#'
    }
];

const StudentChannelPage = () => {
    // In a real app, you would fetch course title by ID
    const courseTitle = "Advanced React Development";

    return (
        <div className="animate-fade-in-up">
            <Link to="/student/channels" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1.5rem'
            }}>
                <ChevronLeft size={16} />
                Back to Channels
            </Link>

            <ChannelHeader
                courseTitle={courseTitle}
            />

            <ChannelFeed messages={MOCK_MESSAGES} userRole="student" />
        </div>
    );
};

export default StudentChannelPage;
