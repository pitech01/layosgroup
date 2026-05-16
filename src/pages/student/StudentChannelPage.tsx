import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ChannelHeader from '../../components/channel/ChannelHeader';
import ChannelFeed from '../../components/channel/ChannelFeed';
import ChatInput from '../../components/channel/ChatInput';
import type { Message } from '../../components/channel/MessageCard';
import { toast } from 'react-hot-toast';

const StudentChannelPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [courseTitle, setCourseTitle] = useState("Course Channel");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
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
            } else {
                toast.error('Failed to access channel');
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

    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string, attachment?: File) => {
        setIsSending(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

            let requestBody: any;
            let headers: any = { 'Authorization': `Bearer ${token}` };

            if (attachment) {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('type', 'message');
                formData.append('attachment', attachment);
                requestBody = formData;
            } else {
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify({
                    content,
                    type: 'message'
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
            } else {
                toast.error('Failed to send message.');
            }
        } catch (error) {
            toast.error('Error sending message.');
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up student-channel-container">
            <style>{`
                .student-channel-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 120px);
                    background: white;
                    border-radius: 24px;
                    border: 1.5px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                    padding: 2rem;
                }

                @media (max-width: 1024px) {
                    .student-channel-container {
                        height: calc(100dvh - 100px);
                        padding: 1rem;
                        border-radius: 0;
                        border: none;
                    }
                }
            `}</style>
            <Link to="/student/channels" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                flex: 'none'
            }}>
                <ChevronLeft size={16} />
                Back to Channels
            </Link>

            <div style={{ padding: '0 10px', flex: 'none' }}>
                <ChannelHeader
                    courseTitle={courseTitle}
                    showPostButton={false}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 1.5rem', display: 'flex', flexDirection: 'column' }}>
                <ChannelFeed messages={messages} userRole="student" />
                <div ref={feedEndRef} />
            </div>

            <div style={{ flex: 'none' }}>
                <ChatInput onSendMessage={handleSendMessage} isSending={isSending} placeholder="Message channel" />
            </div>
        </div>
    );
};

export default StudentChannelPage;
