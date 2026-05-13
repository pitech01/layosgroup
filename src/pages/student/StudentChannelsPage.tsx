import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Search, Hash, Download, Image as ImageIcon, 
    FileText, MessageSquare, X, ChevronLeft,
    Loader2, Info, Send, Menu, HelpCircle, Users, BookOpen,
    Sparkles, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import echo from '../../utils/echo';
import MessageCard from '../../components/channel/MessageCard';
import ChatInput from '../../components/channel/ChatInput';

interface Channel {
    id: string;
    title: string;
    unread?: number;
    type: 'channel' | 'dm';
    status?: 'online' | 'offline' | 'away';
    avatar?: string;
    instructorName?: string;
    description?: string;
    participants?: number;
}

interface ChatMessage {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        role: 'instructor' | 'student';
    };
    content: string;
    timestamp: string;
    date: string;
    isAnnouncement?: boolean;
    isQuestion?: boolean;
    file?: {
        name: string;
        size: string;
        type: 'image' | 'pdf' | 'other';
        url: string;
    };
    isDeleted?: boolean;
}

const StudentChannelsPage = () => {
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [channels, setChannels] = useState<Channel[]>([]);
    const [dms, setDms] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeTab, setActiveTab] = useState<'chat' | 'resources'>('chat');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isAskingQuestion, setIsAskingQuestion] = useState(false);

    // Mobile Responsiveness State
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    
    const navigate = useNavigate();
    const { logout } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatTime = (ts: string) => {
        try {
            const date = new Date(ts);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return '...'; }
    };

    const formatDateDivider = (ts: string) => {
        try {
            const date = new Date(ts);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            if (date.toDateString() === today.toDateString()) return 'Today';
            if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
            
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) { return 'Earlier'; }
    };

    const cleanContent = (content: string, attachmentUrl?: string) => {
        if (!content) return '';
        if (attachmentUrl && content.includes(attachmentUrl)) return '';
        if (content.includes('amazonaws.com') || content.includes('channel_attachments/')) {
            if (attachmentUrl) return '';
        }
        return content;
    };

    const fetchChannels = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            
            const response = await fetch(`${API_URL}/course-channels`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (response.status === 401) {
                logout(); navigate('/login'); return;
            }

            if (response.ok) {
                const dbChannels = await response.json();
                const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');

                const formattedChannels: Channel[] = dbChannels.map((c: any) => {
                    const channelIdStr = c.id.toString();
                    const lastReadId = lastReadMap[channelIdStr];
                    const isUnread = c.latest_message_id && lastReadId !== c.latest_message_id;

                    return {
                        id: channelIdStr,
                        title: c.name,
                        type: 'channel',
                        description: c.description || '',
                        unread: isUnread ? 1 : 0,
                        instructorName: c.instructor_name || 'Expert Faculty'
                    };
                });
                setChannels(formattedChannels);

                if (!activeChannel && formattedChannels.length > 0) {
                    const general = formattedChannels.find(c => c.title === 'general-discussion') || formattedChannels[0];
                    setActiveChannel(general);
                }
            }

            const dmsResponse = await fetch(`${API_URL}/direct-messages/contacts`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (dmsResponse.ok) {
                const fetchedDms = await dmsResponse.json();
                setDms(fetchedDms.map((d: any) => ({ ...d, type: 'dm' })));
            }
        } catch (error) { console.error("Failed to fetch channels", error); }
    };

    useEffect(() => { fetchChannels(); }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChannel) return;
            setIsLoadingMessages(true);
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                let url = activeChannel.type === 'dm' ? `${API_URL}/direct-messages/${activeChannel.id}` : `${API_URL}/channels/${activeChannel.id}/messages`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawMsgs = Array.isArray(data) ? data : (data.messages || []);
                    const formattedMsgs = rawMsgs.map((msg: any) => {
                        let file = undefined;
                        const getFileName = (m: any) => {
                            if (m.attachmentName) return m.attachmentName;
                            if (!m.attachmentUrl) return 'File';
                            const cleanUrl = m.attachmentUrl.split('?')[0];
                            const baseName = cleanUrl.split('/').pop() || 'File';
                            return baseName;
                        };

                        if (msg.attachmentUrl) {
                            file = {
                                name: getFileName(msg),
                                size: 'Linked',
                                type: (msg.attachmentUrl.split('?')[0].match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? 'pdf' : 'other')) as 'image' | 'pdf' | 'other',
                                url: msg.attachmentUrl
                            };
                        }

                        let displayContent = msg.content || '';
                        let isQuestionFlag = false;
                        if (displayContent.startsWith('[QUESTION]')) {
                            isQuestionFlag = true;
                            displayContent = displayContent.replace('[QUESTION]', '').trim();
                        }

                        return {
                            id: String(msg.id),
                            user: { 
                                id: String(msg.senderId || msg.user_id),
                                name: msg.senderName, 
                                avatar: msg.senderName.charAt(0).toUpperCase(), 
                                role: msg.senderRole 
                            },
                            content: cleanContent(displayContent, msg.attachmentUrl),
                            timestamp: msg.createdAt,
                            date: 'Feed',
                            isAnnouncement: msg.type === 'announcement',
                            isQuestion: isQuestionFlag,
                            isDeleted: !!msg.isDeleted,
                            file
                        };
                    });
                    setMessages(formattedMsgs);

                    if (formattedMsgs.length > 0) {
                        const latestMsg = formattedMsgs[formattedMsgs.length - 1];
                        const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');
                        let needsUpdate = false;
                        if (activeChannel.type === 'channel' && lastReadMap[activeChannel.id] !== latestMsg.id) {
                            lastReadMap[activeChannel.id] = latestMsg.id;
                            needsUpdate = true;
                        } else if (activeChannel.type === 'dm' && lastReadMap[`dm_${activeChannel.id}`] !== latestMsg.id) {
                            lastReadMap[`dm_${activeChannel.id}`] = latestMsg.id;
                            needsUpdate = true;
                        }
                        
                        if (needsUpdate) {
                            localStorage.setItem('channels_last_read', JSON.stringify(lastReadMap));
                            if (activeChannel.type === 'channel') {
                                setChannels(prev => prev.map(c => c.id === activeChannel.id ? { ...c, unread: 0 } : c));
                            } else {
                                setDms(prev => prev.map(d => d.id === activeChannel.id ? { ...d, unread: 0 } : d));
                            }
                        }
                    }
                }
            } catch (error) { console.error("Failed to fetch messages", error); }
            finally { setIsLoadingMessages(false); }
        };
        fetchMessages();

        let currentEchoChannel: any;
        if (activeChannel && activeChannel.type === 'channel') {
            currentEchoChannel = echo.channel(`course-channel.${activeChannel.id}`)
                .listen('.message.created', (data: any) => {
                    const msg = data.message;
                    let file = undefined;
                    if (msg.attachmentUrl) {
                        file = {
                            name: msg.attachmentName || 'Shared File',
                            size: 'Linked',
                            type: (msg.attachmentUrl.split('?')[0].match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? 'pdf' : 'other')) as 'image' | 'pdf' | 'other',
                            url: msg.attachmentUrl
                        };
                    }

                    const finalMessage: ChatMessage = {
                        id: String(msg.id),
                        user: { 
                            id: String(msg.senderId || msg.user_id),
                            name: msg.senderName, 
                            avatar: msg.senderName.charAt(0).toUpperCase(), 
                            role: msg.senderRole 
                        },
                        content: msg.content,
                        timestamp: msg.createdAt,
                        date: 'Feed',
                        isAnnouncement: msg.type === 'announcement',
                        isDeleted: !!msg.isDeleted,
                        file
                    };
                    
                    setMessages(prev => {
                        const index = prev.findIndex(m => String(m.id) === String(finalMessage.id));
                        if (index === -1) return [...prev, finalMessage];
                        const newMessages = [...prev];
                        newMessages[index] = { ...prev[index], ...finalMessage };
                        return newMessages;
                    });
                });
        }

        return () => { 
            if (currentEchoChannel) echo.leave(`course-channel.${activeChannel?.id}`); 
        };
    }, [activeChannel]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = async (content: string, attachment?: File) => {
        if (!content.trim() && !attachment) return;
        if (!activeChannel || isSending) return;

        setIsSending(true);
        let originalMessage = content.trim();
        if (isAskingQuestion) originalMessage = '[QUESTION] ' + originalMessage;

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            let url = activeChannel.type === 'dm' ? `${API_URL}/direct-messages/${activeChannel.id}` : `${API_URL}/channels/${activeChannel.id}/messages`;

            const formData = new FormData();
            formData.append('content', originalMessage || 'Multimedia Artifact');
            formData.append('type', 'message');
            if (attachment) formData.append('attachment', attachment);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: formData
            });

            if (response.ok) {
                const msg = await response.json();
                setIsAskingQuestion(false);
            }
        } catch (error) { toast.error('Network error'); }
        finally { setIsSending(false); }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Permanently redact this message?')) return;
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            let url = activeChannel?.type === 'dm' ? `${API_URL}/direct-messages/${activeChannel.id}/${messageId}` : `${API_URL}/channel-messages/${messageId}`;
            const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
            }
        } catch (error) { toast.error('Access Denied'); }
    };

    const handleEditMessage = async (messageId: string, newContent: string) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const url = `${API_URL}/channel-messages/${messageId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            if (response.ok) {
                const updatedMsg = await response.json();
                setMessages(prev => prev.map(m => String(m.id) === String(messageId) ? { ...m, content: updatedMsg.content } : m));
            }
        } catch (error) { toast.error('Synchronization Error'); }
    };

    const handleChannelSelect = (channel: Channel) => {
        setActiveChannel(channel);
        if (channel.unread && channel.unread > 0) {
            if (channel.type === 'channel') {
                setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unread: 0 } : c));
            } else {
                setDms(prev => prev.map(d => d.id === channel.id ? { ...d, unread: 0 } : d));
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
            
            {/* Context Navigation Header */}
            <header className="flex items-center px-6 py-4 md:px-10 md:py-6 border-b border-brand-border bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-xl sticky top-0 z-50 gap-6">
                {activeChannel ? (
                    <button 
                        className="md:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white active:scale-90 transition-all border-none cursor-pointer shadow-sm" 
                        onClick={() => setActiveChannel(null)}
                    >
                        <ChevronLeft size={24} />
                    </button>
                ) : (
                    <div className="md:hidden w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                        <MessageSquare size={24} />
                    </div>
                )}
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-8 min-w-0">
                    {activeChannel ? (
                        <div className="flex flex-col md:hidden min-w-0">
                            <h1 className="text-base font-black text-brand-charcoal dark:text-white truncate leading-none uppercase tracking-tight">
                                {activeChannel.title}
                            </h1>
                            <span className="text-[8px] font-black text-brand-emerald uppercase tracking-[0.2em] mt-1">
                                {activeChannel.type === 'channel' ? 'Curriculum Channel' : 'Direct Support Link'}
                            </span>
                        </div>
                    ) : (
                        <h1 className="md:hidden text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Global Workspace</h1>
                    )}

                    <div className="hidden md:flex flex-1 max-w-[500px] items-center bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl px-5 py-1.5 transition-all duration-300 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-brand-emerald/40 focus-within:shadow-xl focus-within:shadow-brand-emerald/5">
                        <Search size={18} className="text-brand-muted" />
                        <input 
                            type="text" 
                            placeholder="Search archive, artifacts, or entities..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none outline-none p-2.5 w-full text-sm bg-transparent font-bold text-brand-charcoal dark:text-white placeholder:text-brand-muted/50"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-auto shrink-0">
                    {activeChannel && (
                        <button 
                            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all border-none cursor-pointer shadow-sm ${isRightSidebarOpen ? 'bg-brand-emerald text-white shadow-brand-emerald/20 rotate-180' : 'bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                        >
                            <Info size={22} />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Navigation Ecosystem (Sidebar) */}
                <aside className={`
                    w-full md:w-[320px] bg-brand-beige/30 dark:bg-black/5 flex flex-col border-r border-brand-border shrink-0 overflow-y-auto custom-scrollbar transition-all duration-300
                    ${activeChannel ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-8 pb-4">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-muted">Active Curriculums</h3>
                            <Hash size={14} className="text-brand-muted opacity-30" />
                        </div>
                        <div className="space-y-2">
                            {channels.map(channel => (
                                <button 
                                    key={channel.id} 
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[24px] cursor-pointer transition-all duration-300 border-none group relative overflow-hidden ${activeChannel?.id === channel.id && activeChannel?.type === 'channel' ? 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/30' : 'bg-transparent text-brand-muted hover:bg-white dark:hover:bg-white/5 hover:text-brand-charcoal dark:hover:text-white hover:shadow-lg hover:shadow-brand-charcoal/5'}`}
                                    onClick={() => handleChannelSelect(channel)}
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${activeChannel?.id === channel.id && activeChannel?.type === 'channel' ? 'bg-white/10 text-white' : 'bg-white dark:bg-white/10 shadow-sm text-brand-muted group-hover:bg-brand-emerald group-hover:text-white'}`}>
                                        <Hash size={18} />
                                    </div>
                                    <span className="truncate flex-1 font-black text-xs uppercase tracking-widest">{channel.title}</span>
                                    {channel.unread && channel.unread > 0 && (
                                        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-lg min-w-[20px] text-center shadow-lg shadow-red-500/30">NEW</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 pt-4">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-muted">Private Intelligence</h3>
                            <Users size={14} className="text-brand-muted opacity-30" />
                        </div>
                        <div className="space-y-2">
                            {dms.map(dm => (
                                <button 
                                    key={dm.id} 
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[24px] cursor-pointer transition-all duration-300 border-none group relative overflow-hidden ${activeChannel?.id === dm.id && activeChannel?.type === 'dm' ? 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/30' : 'bg-transparent text-brand-muted hover:bg-white dark:hover:bg-white/5 hover:text-brand-charcoal dark:hover:text-white hover:shadow-lg hover:shadow-brand-charcoal/5'}`}
                                    onClick={() => handleChannelSelect(dm)}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm transition-all duration-500 ${activeChannel?.id === dm.id && activeChannel?.type === 'dm' ? 'bg-white/10 text-white' : 'bg-white dark:bg-white/10 group-hover:bg-brand-emerald group-hover:text-white'}`}>
                                        {dm.avatar || dm.title.charAt(0)}
                                    </div>
                                    <span className="truncate flex-1 font-black text-xs uppercase tracking-widest">{dm.title}</span>
                                    {dm.unread && dm.unread > 0 && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/30 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Primary Intelligence Core (Chat) */}
                <main className={`flex-1 flex flex-col bg-white dark:bg-brand-charcoal min-w-0 ${activeChannel ? 'flex' : 'hidden md:flex'}`}>
                    {activeChannel ? (
                        <>
                            {/* Desktop Sub-navigation */}
                            <div className="hidden md:flex p-8 md:px-12 border-b border-brand-border justify-between items-center bg-brand-beige/10 dark:bg-black/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-white/5 flex items-center justify-center text-brand-emerald shadow-xl shadow-brand-charcoal/5 border border-brand-border group">
                                        {activeChannel.type === 'channel' ? <Hash size={32} /> : <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 flex items-center justify-center font-black text-xs">{activeChannel.avatar || activeChannel.title.charAt(0)}</div>}
                                    </div>
                                    <div>
                                        <h2 className="m-0 font-black text-brand-charcoal dark:text-white text-2xl tracking-tight uppercase">{activeChannel.title}</h2>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                                                <Sparkles size={12} className="text-brand-emerald" /> 
                                                {activeChannel.instructorName || 'Collaborative Hub'}
                                            </span>
                                            <span className="w-1 h-1 bg-brand-border rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Secure Channel</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 p-1.5 bg-brand-beige/50 dark:bg-white/5 rounded-[20px] border border-brand-border">
                                    <button 
                                        className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border-none cursor-pointer ${activeTab === 'chat' ? 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-lg shadow-brand-charcoal/20' : 'text-brand-muted hover:bg-white dark:hover:bg-white/10'}`} 
                                        onClick={() => setActiveTab('chat')}
                                    >
                                        <MessageSquare size={16} /> Discussion
                                    </button>
                                    <button 
                                        className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border-none cursor-pointer ${activeTab === 'resources' ? 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-lg shadow-brand-charcoal/20' : 'text-brand-muted hover:bg-white dark:hover:bg-white/10'}`} 
                                        onClick={() => setActiveTab('resources')}
                                    >
                                        <BookOpen size={16} /> Artifacts
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Context Tabs */}
                            <div className="md:hidden flex border-b border-brand-border bg-brand-beige/30 dark:bg-white/5">
                                <button className={`flex-1 py-5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border-b-4 transition-all border-none cursor-pointer bg-transparent ${activeTab === 'chat' ? 'text-brand-emerald border-brand-emerald' : 'text-brand-muted border-transparent'}`} onClick={() => setActiveTab('chat')}>
                                    <MessageSquare size={16} /> Discussion
                                </button>
                                <button className={`flex-1 py-5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border-b-4 transition-all border-none cursor-pointer bg-transparent ${activeTab === 'resources' ? 'text-brand-emerald border-brand-emerald' : 'text-brand-muted border-transparent'}`} onClick={() => setActiveTab('resources')}>
                                    <BookOpen size={16} /> Artifacts
                                </button>
                            </div>

                            {/* Feed Ecosystem */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-beige/10 dark:bg-brand-charcoal">
                                {activeTab === 'chat' ? (
                                    <div className="p-6 md:p-12 flex flex-col min-h-full">
                                        {messages.length === 0 && !isLoadingMessages ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-24 space-y-8 animate-in fade-in zoom-in duration-500">
                                                <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-[48px] flex items-center justify-center shadow-xl border border-brand-border group relative">
                                                    <div className="absolute inset-0 bg-brand-emerald/5 rounded-[48px] animate-pulse" />
                                                    <MessageSquare size={64} className="text-brand-muted opacity-20 relative z-10 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Initiate Broadcast</h3>
                                                    <p className="text-brand-muted max-w-xs font-medium leading-relaxed mx-auto">This channel is primed for discussion. Be the first to synchronize with the cohort.</p>
                                                </div>
                                                <button onClick={() => document.querySelector('textarea')?.focus()} className="bg-brand-emerald text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer">
                                                    Open Input Terminal
                                                </button>
                                            </div>
                                        ) : isLoadingMessages ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                                                <p className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-muted animate-pulse">Retrieving Historical Log...</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => {
                                                const showDate = idx === 0 || formatDateDivider(msg.timestamp) !== formatDateDivider(messages[idx - 1].timestamp);
                                                const isMine = currentUser && String(msg.user.id) === String(currentUser.id);
                                                const compact = !showDate && idx > 0 && String(messages[idx - 1].user.id) === String(msg.user.id) &&
                                                                (new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() < 5 * 60 * 1000);

                                                return (
                                                    <React.Fragment key={msg.id}>
                                                        {showDate && (
                                                            <div className="flex items-center my-12 gap-8 px-6">
                                                                <div className="flex-1 h-px bg-brand-border" />
                                                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] whitespace-nowrap bg-brand-beige/50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-brand-border">{formatDateDivider(msg.timestamp)}</span>
                                                                <div className="flex-1 h-px bg-brand-border" />
                                                            </div>
                                                        )}
                                                        <MessageCard 
                                                            message={{
                                                                id: msg.id,
                                                                senderName: msg.user.name,
                                                                senderRole: msg.user.role,
                                                                type: msg.isAnnouncement ? 'announcement' : 'message',
                                                                content: msg.content,
                                                                attachmentUrl: msg.file?.url,
                                                                isDeleted: msg.isDeleted,
                                                                createdAt: formatTime(msg.timestamp)
                                                            }} 
                                                            viewerRole="student" 
                                                            onDelete={isMine ? () => handleDeleteMessage(msg.id) : undefined}
                                                            onEdit={isMine ? (newContent) => handleEditMessage(msg.id, newContent) : undefined}
                                                            isMine={isMine}
                                                            compact={compact}
                                                        />
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className="p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 content-start animate-in fade-in duration-500">
                                        {messages.filter(m => m.file).length > 0 ? (
                                            messages.filter(m => m.file).map(m => (
                                                <div key={m.id} className="p-6 bg-white dark:bg-white/5 rounded-[32px] border border-brand-border hover:border-brand-emerald hover:shadow-2xl hover:shadow-brand-emerald/10 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                                                        <FileText size={80} />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <div className="w-16 h-16 rounded-2xl bg-brand-beige dark:bg-white/10 text-brand-emerald flex items-center justify-center mb-6 shadow-inner group-hover:bg-brand-emerald group-hover:text-white transition-all duration-500">
                                                            {m.file?.type === 'image' ? <ImageIcon size={28} /> : <FileText size={28} />}
                                                        </div>
                                                        <div className="space-y-2 mb-8">
                                                            <p className="text-base font-black text-brand-charcoal dark:text-white truncate uppercase tracking-tight">{m.file?.name}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-brand-muted font-black uppercase tracking-widest">
                                                                <Users size={12} /> {m.user.name} • {formatTime(m.timestamp)}
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={m.file?.url} 
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="w-full h-12 flex items-center justify-center bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] no-underline hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20"
                                                        >
                                                            Launch Artifact
                                                        </a>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-32 text-center bg-brand-beige/20 dark:bg-white/5 rounded-[48px] border-2 border-dashed border-brand-border m-4 space-y-6">
                                                <div className="w-24 h-24 bg-white dark:bg-white/10 rounded-[40px] flex items-center justify-center mx-auto shadow-sm border border-brand-border">
                                                    <BookOpen size={40} className="text-brand-muted opacity-20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Ecosystem Void</h3>
                                                    <p className="text-brand-muted font-medium max-w-sm mx-auto">Shared curriculum artifacts and multimedia resources will be indexed here as they are deployed in discussion.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Input Terminal */}
                            <footer className="bg-white dark:bg-brand-charcoal border-t border-brand-border p-6 md:p-8 space-y-4">
                                <ChatInput 
                                    onSendMessage={handleSendMessage} 
                                    isSending={isSending}
                                    placeholder={isAskingQuestion ? "Formulate your technical inquiry..." : `Synchronize with #${activeChannel.title}...`}
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => setIsAskingQuestion(!isAskingQuestion)}
                                        className={`group px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 border-none cursor-pointer text-[10px] font-black uppercase tracking-[0.15em] shadow-sm
                                            ${isAskingQuestion 
                                                ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' 
                                                : 'bg-brand-beige dark:bg-white/5 text-brand-muted hover:text-brand-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:shadow-lg'}`}
                                    >
                                        <HelpCircle size={16} className={isAskingQuestion ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} /> 
                                        <span>{isAskingQuestion ? 'Inquiry Mode Active' : 'Initiate Inquiry'}</span>
                                    </button>
                                    <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest opacity-50">
                                        <ShieldCheck size={14} className="text-brand-emerald" /> End-to-End Encryption Active
                                    </div>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-brand-beige/50 dark:bg-brand-charcoal/50 space-y-10">
                             <div className="relative">
                                <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-[48px] flex items-center justify-center shadow-2xl border border-brand-border">
                                    <Users size={64} className="text-brand-muted opacity-20" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-emerald text-white rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                                    <MessageSquare size={24} />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Intelligence Network</h3>
                                <p className="text-brand-muted max-w-sm font-medium text-lg leading-relaxed mx-auto">Select a curriculum vector or direct support link to initiate data synchronization with the community.</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-brand-border text-center">
                                    <div className="text-2xl font-black text-brand-emerald">{channels.length}</div>
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">Available Channels</div>
                                </div>
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-brand-border text-center">
                                    <div className="text-2xl font-black text-brand-emerald">{dms.length}</div>
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">Support Contacts</div>
                                </div>
                             </div>
                        </div>
                    )}
                </main>

                {/* Information Hub (Right Sidebar) */}
                {isRightSidebarOpen && activeChannel && (
                    <aside className="fixed inset-0 z-[1000] md:relative md:inset-auto w-full md:w-[360px] h-full flex flex-col pointer-events-none md:pointer-events-auto animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm md:hidden pointer-events-auto transition-opacity" onClick={() => setIsRightSidebarOpen(false)} />
                        
                        <div className="ml-auto w-[85%] sm:w-[360px] md:w-full h-full bg-white dark:bg-brand-charcoal border-l border-brand-border flex flex-col shrink-0 overflow-y-auto relative z-10 pointer-events-auto animate-in slide-in-from-right duration-500 shadow-2xl">
                            <div className="p-8 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white/90 dark:bg-brand-charcoal/90 backdrop-blur-xl z-20">
                                <div className="flex items-center gap-3">
                                    <Info size={20} className="text-brand-emerald" />
                                    <h3 className="m-0 font-black text-brand-charcoal dark:text-white uppercase tracking-tight text-xl">Intelligence Brief</h3>
                                </div>
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-beige dark:bg-white/5 text-brand-muted hover:text-red-500 transition-all cursor-pointer border-none" onClick={() => setIsRightSidebarOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-8 flex flex-col gap-10">
                                {/* Profile Card */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-3xl bg-brand-charcoal dark:bg-brand-emerald flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-brand-charcoal/20">
                                            {activeChannel.type === 'channel' ? <Hash size={36} /> : (activeChannel.avatar || activeChannel.title.charAt(0))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="m-0 font-black text-brand-charcoal dark:text-white text-xl truncate uppercase tracking-tight">{activeChannel.title}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mt-1 block">{activeChannel.type === 'channel' ? 'Curriculum Vector' : 'Support Link'}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-brand-beige/30 dark:bg-white/5 rounded-[32px] border border-brand-border/50">
                                        <p className="m-0 text-sm text-brand-muted leading-relaxed font-medium">
                                            {activeChannel.description || 'Optimized communication vector for broadcasting instructional artifacts and facilitating peer-to-peer technical coordination.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Faculty Link */}
                                {activeChannel.instructorName && (
                                    <div className="space-y-4">
                                        <h4 className="m-0 text-[10px] uppercase font-black tracking-[0.3em] text-brand-muted ml-1">Assigned Faculty</h4>
                                        <div className="group flex items-center justify-between p-5 bg-white dark:bg-white/5 border border-brand-border rounded-[28px] shadow-sm hover:shadow-xl hover:border-brand-emerald transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-emerald text-white flex items-center justify-center font-black shadow-lg shadow-brand-emerald/20 group-hover:scale-110 transition-transform">{activeChannel.instructorName.charAt(0)}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-brand-charcoal dark:text-white text-sm uppercase tracking-tight">{activeChannel.instructorName}</span>
                                                    <span className="text-[9px] font-black text-brand-emerald uppercase tracking-widest mt-0.5">Faculty Lead</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                    </div>
                                )}

                                {/* Security Protocol Card */}
                                <div className="p-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[40px] relative overflow-hidden shadow-2xl shadow-brand-charcoal/20">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <ShieldCheck size={100} />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <h5 className="text-sm font-black uppercase tracking-[0.2em]">Security Protocol</h5>
                                        <p className="text-xs text-brand-beige/60 font-medium leading-relaxed">All transmissions within this vector are end-to-end encrypted and logged for academic integrity. Artifacts shared are subject to intellectual property regulations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default StudentChannelsPage;
