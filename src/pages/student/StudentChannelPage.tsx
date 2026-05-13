import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, MessageSquare, Sparkles } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-brand-emerald" size={40} />
                <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Initializing Channel...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
            {/* Header Navigation */}
            <div className="flex items-center px-6 py-4 md:px-10 md:py-6 border-b border-brand-border bg-brand-beige/20 dark:bg-white/5 backdrop-blur-xl shrink-0 gap-6">
                <Link 
                    to="/student/channels" 
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-white/10 text-brand-muted hover:text-brand-emerald transition-all active:scale-90 no-underline shadow-sm"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-brand-emerald" size={16} />
                        <h1 className="text-lg md:text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight truncate leading-none">
                            {courseTitle}
                        </h1>
                    </div>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <Sparkles size={10} className="text-brand-emerald" /> Curriculum Synchronization Active
                    </p>
                </div>
            </div>

            {/* Discussion Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8 bg-brand-beige/5 dark:bg-brand-charcoal">
                <ChannelFeed messages={messages} userRole="student" />
                <div ref={feedEndRef} />
            </div>

            {/* Input Terminal */}
            <div className="p-6 md:p-8 bg-white dark:bg-brand-charcoal border-t border-brand-border shrink-0">
                <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isSending={isSending} 
                    placeholder={`Transmit to #${courseTitle.toLowerCase().replace(/\s+/g, '-')}`} 
                />
            </div>
        </div>
    );
};

export default StudentChannelPage;
