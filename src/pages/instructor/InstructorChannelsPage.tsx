import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Search, Hash, Users, Circle, Trash2,
    Plus, Filter, X, Info, 
    Megaphone, Loader2, MessageSquare,
    ChevronRight, ArrowLeft, MoreVertical,
    Paperclip, Send, Bell, Settings,
    Layout, Globe, Zap, CheckCircle2,
    Clock, ShieldCheck, Sparkles, Layers
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
    description?: string;
    participants?: number;
}

interface ChatMessage {
    id: string;
    user: {
        id: number | string;
        name: string;
        avatar: string;
        role?: 'instructor' | 'student';
    };
    content: string;
    timestamp: string;
    date: string;
    isAnnouncement?: boolean;
    isDeleted?: boolean;
    file?: {
        name: string;
        size: string;
        type: 'image' | 'pdf' | 'other';
        url: string;
    };
}

const InstructorChannelsPage = () => {
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [channels, setChannels] = useState<Channel[]>([]);
    const [dms, setDms] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    // Announcement Modal State
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');

    // UI Layout State
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    
    // Create Channel State
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [targetCourseId, setTargetCourseId] = useState<string>('general');
    const [instructorCourses, setInstructorCourses] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const cleanContent = (content: string, attachmentUrl?: string) => {
        if (!content) return '';
        if (attachmentUrl && content.includes(attachmentUrl)) return '';
        return content;
    };

    const fetchChannels = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            
            const channelsResponse = await fetch(`${API_URL}/course-channels`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (channelsResponse.status === 401) {
                logout();
                navigate('/instructor-login');
                return;
            }

            if (channelsResponse.ok) {
                const dbChannels = await channelsResponse.json();
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
                        unread: isUnread ? 1 : 0
                    };
                });

                setChannels(formattedChannels);
                if (!activeChannel && formattedChannels.length > 0) {
                    setActiveChannel(formattedChannels.find(c => c.title === 'general-discussion') || formattedChannels[0]);
                }
            }

            const cohortsResponse = await fetch(`${API_URL}/cohorts`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (cohortsResponse.ok) {
                const cohorts = await cohortsResponse.json();
                setInstructorCourses(cohorts.map((c: any) => c.course).filter(Boolean));
            }

            const dmsResponse = await fetch(`${API_URL}/direct-messages/contacts`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (dmsResponse.ok) setDms(await dmsResponse.json());
        } catch (error) {
            console.error("Failed to fetch channels", error);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return toast.error('Channel name is required');
        setIsCreatingChannel(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/course-channels`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newChannelName, description: newChannelDesc, course_id: targetCourseId === 'general' ? null : targetCourseId })
            });
            if (response.ok) {
                toast.success('Channel initialized');
                setIsCreateChannelModalOpen(false);
                setNewChannelName('');
                setNewChannelDesc('');
                fetchChannels();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Initialization failed');
            }
        } catch (error) {
            toast.error('Network interruption');
        } finally {
            setIsCreatingChannel(false);
        }
    };

    const handleDeleteChannel = async () => {
        if (!activeChannel || activeChannel.type !== 'channel') return;
        if (!window.confirm(`Are you sure you want to redact the channel #${activeChannel.title}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${API_URL}/course-channels/${activeChannel.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                toast.success('Channel redacted');
                setActiveChannel(null);
                fetchChannels();
            }
        } catch (error) {
            toast.error('Redaction failed');
        }
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            fetchChannels();
            if (!activeChannel) return;
            setIsLoadingMessages(true);
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                const url = activeChannel.type === 'dm' ? `${API_URL}/direct-messages/${activeChannel.id}` : `${API_URL}/channels/${activeChannel.id}/messages`;
                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
                if (response.ok) {
                    const data = await response.json();
                    const rawMsgs = Array.isArray(data) ? data : (data.messages || []);
                    const formattedMsgs = rawMsgs.map((msg: any) => ({
                        id: String(msg.id),
                        user: { id: msg.userId || msg.user_id || msg.senderId, name: msg.senderName, avatar: msg.senderName.charAt(0).toUpperCase(), role: msg.senderRole },
                        content: cleanContent(msg.content, msg.attachmentUrl),
                        timestamp: msg.createdAt,
                        date: 'Feed',
                        isAnnouncement: msg.type === 'announcement',
                        isDeleted: !!msg.isDeleted,
                        file: msg.attachmentUrl ? {
                            name: msg.attachmentName || 'Shared Artifact',
                            size: 'Linked',
                            type: (msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'other')),
                            url: msg.attachmentUrl
                        } : undefined
                    }));
                    setMessages(formattedMsgs);
                }
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchAll();

        let currentEchoChannel: any;
        if (activeChannel?.type === 'channel') {
            currentEchoChannel = echo.channel(`course-channel.${activeChannel.id}`)
                .listen('.message.created', (data: any) => {
                    const msg = data.message;
                    setMessages(prev => {
                        if (prev.some(m => m.id === String(msg.id))) return prev;
                        return [...prev, {
                            id: String(msg.id),
                            user: { id: msg.user_id, name: msg.senderName, avatar: msg.senderName.charAt(0).toUpperCase(), role: msg.senderRole },
                            content: cleanContent(msg.content, msg.attachmentUrl),
                            timestamp: msg.createdAt,
                            date: 'Feed',
                            isAnnouncement: msg.type === 'announcement',
                            isDeleted: !!msg.isDeleted,
                            file: msg.attachmentUrl ? { name: msg.attachmentName || 'Shared Artifact', size: 'Linked', type: (msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'other')), url: msg.attachmentUrl } : undefined
                        }];
                    });
                })
                .listen('.message.deleted', (data: any) => setMessages(prev => prev.map(m => m.id === String(data.messageId) ? { ...m, isDeleted: true } : m)));
        }

        return () => {
            if (currentEchoChannel) echo.leave(`course-channel.${activeChannel?.id}`);
        };
    }, [activeChannel]);

    const handleSendMessage = async (content: string, attachment: File | null = null, msgType: 'message' | 'announcement' = 'message') => {
        if (!content.trim() && !attachment) return;
        if (!activeChannel || isSending) return;
        setIsSending(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const url = activeChannel.type === 'dm' ? `${API_URL}/direct-messages/${activeChannel.id}` : `${API_URL}/channels/${activeChannel.id}/messages`;
            const formData = new FormData();
            formData.append('content', content || 'Shared Artifact');
            formData.append('type', msgType);
            if (attachment) formData.append('attachment', attachment);
            const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, body: formData });
            if (response.ok) {
                const msg = await response.json();
                setMessages(prev => [...prev, {
                    id: String(msg.id),
                    user: { id: msg.user_id, name: msg.senderName, avatar: msg.senderName.charAt(0).toUpperCase(), role: msg.senderRole },
                    content: msg.content,
                    timestamp: msg.createdAt,
                    date: 'Feed',
                    isAnnouncement: msg.type === 'announcement',
                    isDeleted: !!msg.isDeleted,
                    file: msg.attachmentUrl ? { name: msg.attachmentName || 'Shared Artifact', size: 'Linked', type: 'other', url: msg.attachmentUrl } : undefined
                }]);
            }
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Sidebar: Channels & Contacts */}
            <aside className={`w-80 border-r border-brand-border flex flex-col transition-all duration-500 ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-20 h-full'}`}>
                <div className="p-8 space-y-8 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-emerald/10 rounded-lg">
                                <MessageSquare size={18} className="text-brand-emerald" />
                            </div>
                            <h2 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Hub</h2>
                        </div>
                        <button onClick={fetchChannels} className="p-2 hover:bg-brand-beige dark:hover:bg-white/5 rounded-xl transition-all border-none cursor-pointer"><Settings size={18} className="text-brand-muted" /></button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find artifact..." 
                            className="w-full h-12 pl-12 pr-4 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-xs font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10">
                        {/* Channels */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Communications</span>
                                <button onClick={() => setIsCreateChannelModalOpen(true)} className="p-1 hover:text-brand-emerald transition-colors border-none cursor-pointer"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-1">
                                {channels.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveChannel(c)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-none cursor-pointer ${activeChannel?.id === c.id ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' : 'text-brand-muted hover:bg-brand-beige/50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Hash size={16} className={activeChannel?.id === c.id ? 'text-white' : 'text-brand-emerald'} />
                                            <span className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{c.title}</span>
                                        </div>
                                        {c.unread ? <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> : null}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Direct Messages */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Direct Links</span>
                                <button className="p-1 hover:text-brand-emerald transition-colors border-none cursor-pointer"><Users size={16} /></button>
                            </div>
                            <div className="space-y-1">
                                {dms.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setActiveChannel({ ...d, type: 'dm' })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-none cursor-pointer ${activeChannel?.id === d.id ? 'bg-brand-charcoal text-white shadow-xl' : 'text-brand-muted hover:bg-brand-beige/50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-brand-emerald text-white rounded-xl flex items-center justify-center font-black text-sm border-2 border-brand-border">
                                                {d.title.charAt(0)}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-brand-charcoal ${d.status === 'online' ? 'bg-emerald-500' : 'bg-brand-muted'}`}></div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight truncate">{d.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-brand-beige/10 dark:bg-white/5">
                {!activeChannel ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-fade-in">
                        <div className="w-32 h-32 bg-brand-beige dark:bg-white/5 rounded-xl flex items-center justify-center text-brand-muted/30 shadow-inner">
                            <Globe size={64} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Select an Uplink</h3>
                            <p className="text-brand-muted font-medium max-w-sm mx-auto">Choose a communication channel or contact to begin synchronization.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="h-24 px-10 border-b border-brand-border flex items-center justify-between bg-white dark:bg-brand-charcoal z-10">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="md:hidden p-2 hover:bg-brand-beige rounded-xl border-none cursor-pointer"><ArrowLeft size={20} /></button>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        {activeChannel.type === 'channel' ? <Hash className="text-brand-emerald" size={20} /> : <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>}
                                        <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">{activeChannel.title}</h3>
                                    </div>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{activeChannel.description || 'Secure communication link active'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsAnnouncementModalOpen(true)} className="h-10 px-6 bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all border-none cursor-pointer"><Megaphone size={14} /> Broadcast</button>
                                <button onClick={handleDeleteChannel} className="w-10 h-10 flex items-center justify-center text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border-none cursor-pointer"><Trash2 size={20} /></button>
                                <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className={`p-2 rounded-xl transition-all border-none cursor-pointer ${isRightSidebarOpen ? 'bg-brand-emerald text-white' : 'hover:bg-brand-beige text-brand-muted'}`}><Info size={20} /></button>
                            </div>
                        </header>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            {isLoadingMessages ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-brand-emerald" size={32} />
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recovering Artifacts...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-12 text-center border-b border-brand-border border-dashed space-y-4 mb-12">
                                        <div className="w-20 h-20 bg-brand-emerald/10 text-brand-emerald rounded-[32px] flex items-center justify-center mx-auto">
                                            <Sparkles size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Channel Initialized</h4>
                                            <p className="text-xs font-medium text-brand-muted">This is the origin of the #{activeChannel.title} stream.</p>
                                        </div>
                                    </div>

                                    {messages.map((msg, i) => (
                                        <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <MessageCard 
                                                message={msg as any} 
                                                isMe={String(msg.user.id) === String(currentUser?.id)}
                                                onDelete={() => {}} 
                                                onEdit={() => {}}
                                            />
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <footer className="p-8 pt-0">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput 
                                    onSendMessage={(content, file) => handleSendMessage(content, file)} 
                                    placeholder={`Secure transmission to #${activeChannel.title}...`}
                                />
                            </div>
                        </footer>
                    </>
                )}
            </main>

            {/* Right Sidebar: Intel */}
            {activeChannel && isRightSidebarOpen && (
                <aside className="w-80 border-l border-brand-border bg-white dark:bg-brand-charcoal flex flex-col animate-slide-in">
                    <div className="p-10 space-y-10">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Intel Package</h4>
                            <div className="bg-brand-beige/30 dark:bg-white/5 rounded-[32px] p-8 border border-brand-border space-y-6">
                                <div className="w-16 h-16 bg-brand-emerald text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-emerald/20">
                                    {activeChannel.type === 'channel' ? <Hash size={32} /> : <div className="text-2xl font-black">{activeChannel.title.charAt(0)}</div>}
                                </div>
                                <div className="text-center space-y-1">
                                    <h5 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{activeChannel.title}</h5>
                                    <p className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">{activeChannel.type === 'channel' ? 'Public Node' : 'Private Uplink'}</p>
                                </div>
                                <p className="text-xs text-brand-muted font-medium text-center leading-relaxed italic">"{activeChannel.description || 'Standard communication protocol established for academic synchronization.'}"</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Active Nodes</h4>
                                <span className="px-2 py-1 bg-brand-emerald/10 text-brand-emerald rounded-lg text-[10px] font-black">24</span>
                            </div>
                            <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 bg-brand-beige dark:bg-white/10 rounded-xl flex items-center justify-center font-black text-xs text-brand-charcoal border border-brand-border">JD</div>
                                        <div className="flex-1">
                                            <div className="text-xs font-black text-brand-charcoal dark:text-white uppercase truncate">John Doe</div>
                                            <div className="text-[8px] font-bold text-brand-emerald uppercase tracking-widest">Active Now</div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full h-12 border-2 border-brand-border border-dashed rounded-xl text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-brand-emerald hover:border-brand-emerald transition-all border-none cursor-pointer">Explore Roster</button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Shared Artifacts</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="aspect-square bg-brand-beige dark:bg-white/10 rounded-2xl border border-brand-border flex items-center justify-center group overflow-hidden relative">
                                        <Layers className="text-brand-muted group-hover:scale-110 transition-transform" size={24} />
                                        <div className="absolute inset-0 bg-brand-emerald/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ChevronRight className="text-white" /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Modals */}
            {isCreateChannelModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsCreateChannelModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-brand-charcoal rounded-[48px] p-12 space-y-10 shadow-2xl animate-scale-up">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Initialize Channel</h3>
                            <p className="text-brand-muted font-medium">Define the parameters for a new communication node.</p>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Identifier</label>
                                <input 
                                    type="text" 
                                    className="w-full h-16 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald font-bold" 
                                    placeholder="e.g. project-x-dev"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Mission Description</label>
                                <textarea 
                                    className="w-full p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald font-bold h-32 resize-none" 
                                    placeholder="Brief summary of channel objective..."
                                    value={newChannelDesc}
                                    onChange={(e) => setNewChannelDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsCreateChannelModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-brand-muted hover:bg-brand-beige transition-all border-none cursor-pointer">Abort</button>
                            <button onClick={handleCreateChannel} disabled={isCreatingChannel} className="flex-1 h-14 bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-emerald/20 hover:scale-105 transition-all border-none cursor-pointer">
                                {isCreatingChannel ? <Loader2 className="animate-spin" /> : 'Confirm Protocol'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorChannelsPage;
