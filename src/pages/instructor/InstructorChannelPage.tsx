import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ChannelHeader from '../../components/channel/ChannelHeader';
import ChannelFeed from '../../components/channel/ChannelFeed';
import CreatePostModal from '../../components/channel/CreatePostModal';
import ChatInput from '../../components/channel/ChatInput';
import type { Message } from '../../components/channel/MessageCard';
import { toast } from 'react-hot-toast';

const InstructorChannelPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [courseTitle, setCourseTitle] = useState("Course Channel");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const feedEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/courses/${courseId}/channels`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCourseTitle(data.courseTitle);
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchMessages();
        }
    }, [courseId]);

    // Auto-scroll to bottom of feed when messages update
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const postToChannel = async (payload: any) => {
        setIsSending(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

            // Format as form data if there's an attachment
            let requestBody: any;
            let headers: any = { 'Authorization': `Bearer ${token}` };

            if (payload.attachment) {
                const formData = new FormData();
                formData.append('content', payload.content);
                formData.append('type', payload.type);
                if (payload.dueDate) formData.append('due_date', payload.dueDate);
                formData.append('attachment', payload.attachment);
                requestBody = formData;
            } else {
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify({
                    content: payload.content,
                    type: payload.type,
                    due_date: payload.dueDate
                });
            }

            const response = await fetch(`${API_URL}/courses/${courseId}/channels`, {
                method: 'POST',
                headers,
                body: requestBody
            });

            if (response.ok) {
                const newMessage = await response.json();
                setMessages(prev => [...prev, newMessage]);
                if (payload.type !== 'message') toast.success(`${payload.type} posted successfully!`);
            } else {
                toast.error('Failed to post message.');
            }
        } catch (error) {
            toast.error('Error posting message.');
        } finally {
            setIsSending(false);
            setIsModalOpen(false);
        }
    };

    const handleCreatePost = (newPost: Partial<Message> & { attachment?: File }) => {
        postToChannel({
            content: newPost.content,
            type: newPost.type,
            dueDate: newPost.dueDate,
            attachment: newPost.attachment
        });
    };

    const handleSendMessage = (content: string, attachment?: File) => {
        postToChannel({
            content,
            type: 'message',
            attachment
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up instructor-channel-container">
            <style>{`
                .instructor-channel-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 150px);
                    overflow: hidden;
                }

                @media (max-width: 768px) {
                    .instructor-channel-container {
                        height: calc(100dvh - 120px);
                    }
                    .channel-breadcrumb {
                        margin-bottom: 1rem !important;
                    }
                }

                @media (max-width: 480px) {
                    .instructor-channel-container {
                        padding: 0;
                    }
                }
            `}</style>

            <Link to="/instructor/channels" className="channel-breadcrumb" style={{
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

            <div style={{ padding: '0 10px', flex: 'none' }}>
                <ChannelHeader
                    courseTitle={courseTitle}
                    showPostButton={true}
                    onNewPost={() => setIsModalOpen(true)}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 1.5rem', display: 'flex', flexDirection: 'column' }}>
                <ChannelFeed messages={messages} userRole="instructor" />
                <div ref={feedEndRef} />
            </div>

            <div style={{ flex: 'none' }}>
                <ChatInput onSendMessage={handleSendMessage} isSending={isSending} placeholder="Message channel (use '+' button for announcements)" />
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePost}
            />
        </div>
    );
};

export default InstructorChannelPage;
