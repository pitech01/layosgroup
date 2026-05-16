import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    ChevronLeft, 
    Loader2, 
    MessageSquare, 
    Zap, 
    Sparkles, 
    ShieldCheck, 
    Info,
    Hash,
    MoreVertical,
    Plus
} from 'lucide-react';
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
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Establishing Uplink...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Link 
                        to="/instructor/channels" 
                        className="group flex items-center gap-3 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Communications
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg text-brand-emerald">
                            <MessageSquare size={18} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                            Course <span className="text-brand-emerald">Channel</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-brand-beige/20 dark:bg-white/5 rounded-[24px] border border-brand-border">
                    <div className="w-10 h-10 bg-brand-emerald text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-emerald/20">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-0.5 pr-4">
                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Security Status</div>
                        <div className="text-xs font-black text-brand-charcoal dark:text-white uppercase">Encrypted Link</div>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 flex flex-col h-[calc(100vh-280px)]">
                {/* Chat Sub-header */}
                <div className="px-10 py-6 border-b border-brand-border bg-brand-beige/10 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-brand-charcoal border border-brand-border rounded-2xl flex items-center justify-center text-brand-emerald shadow-sm">
                            <Hash size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">{courseTitle}</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Stream</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="h-12 px-6 bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-emerald/20 border-none cursor-pointer"
                        >
                            <Plus size={16} /> Broadcast Artifact
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center text-brand-muted hover:bg-brand-beige dark:hover:bg-white/5 rounded-xl transition-all border-none cursor-pointer">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <div className="py-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto text-brand-muted/30 border border-brand-border border-dashed">
                            <Sparkles size={40} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Channel Origin</h4>
                            <p className="text-brand-muted font-medium text-sm max-w-xs mx-auto italic">"Synchronize instruction and foster academic collaboration within this secure curriculum node."</p>
                        </div>
                    </div>

                    <ChannelFeed messages={messages} userRole="instructor" />
                    <div ref={feedEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-8 border-t border-brand-border bg-brand-beige/5 dark:bg-white/5">
                    <div className="max-w-4xl mx-auto">
                        <ChatInput 
                            onSendMessage={handleSendMessage} 
                            isSending={isSending} 
                            placeholder="Message channel (use '+' button for announcements)" 
                        />
                    </div>
                </div>
            </div>

            {/* Intelligence Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-8 bg-brand-emerald text-white rounded-xl shadow-xl shadow-brand-emerald/20 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Real-time</div>
                        <div className="text-sm font-black uppercase tracking-tight leading-none">Instant Delivery</div>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-brand-beige dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald group-hover:scale-110 transition-transform">
                        <Info size={24} />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Protocol</div>
                        <div className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Archived Feed</div>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-brand-beige dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald group-hover:scale-110 transition-transform">
                        <Sparkles size={24} />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Interaction</div>
                        <div className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Global Roster</div>
                    </div>
                </div>
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

