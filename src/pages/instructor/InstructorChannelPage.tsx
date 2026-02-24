import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ChannelHeader from '../../components/channel/ChannelHeader';
import ChannelFeed from '../../components/channel/ChannelFeed';
import CreatePostModal from '../../components/channel/CreatePostModal';
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
        id: '2',
        senderName: 'Sarah Wilson',
        senderRole: 'instructor',
        type: 'message',
        content: 'Does everyone have access to the Figma files for this week?',
        createdAt: 'Feb 16, 2024'
    },
    {
        id: '3',
        senderName: 'Michael Brown',
        senderRole: 'student',
        type: 'message',
        content: 'Yes, I got them! Thanks Sarah.',
        createdAt: 'Feb 16, 2024'
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

const InstructorChannelPage = () => {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // In a real app, you would fetch course title by ID
    const courseTitle = "Advanced React Development";

    const handleCreatePost = (newPost: Partial<Message>) => {
        const post: Message = {
            id: Date.now().toString(),
            senderName: 'Sarah Wilson', // Mock logged in instructor
            senderRole: 'instructor',
            type: newPost.type as any,
            content: newPost.content as string,
            dueDate: newPost.dueDate,
            createdAt: 'Just now',
            attachmentUrl: newPost.attachmentUrl
        };
        setMessages([...messages, post]);
    };

    return (
        <div className="animate-fade-in-up">
            <Link to="/instructor/channels" style={{
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
                showPostButton={true}
                onNewPost={() => setIsModalOpen(true)}
            />

            <ChannelFeed messages={messages} userRole="instructor" />

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePost}
            />
        </div>
    );
};

export default InstructorChannelPage;
