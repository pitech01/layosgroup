import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Search, Hash, Users, Circle, Download, Image as ImageIcon, 
    FileText, MessageSquare, Filter, X, File as FileGeneric,
    Pin, AlertCircle, HelpCircle, BookOpen, GraduationCap, Loader2
} from 'lucide-react';
import echo from '../../utils/echo';
import MessageCard from '../../components/channel/MessageCard';
import type { Message } from '../../components/channel/MessageCard';
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
    isDeleted?: boolean; // Added isDeleted property
}

const StudentChannelsPage = () => {
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const [channels, setChannels] = useState<Channel[]>([]);
    const [dms, setDms] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isAskingQuestion, setIsAskingQuestion] = useState(false);
    const [showPinned, setShowPinned] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'resources'>('chat');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    
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
                headers: { 'Authorization': `Bearer ${token}` }
            });

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
                        unread: isUnread ? 1 : 0
                    };
                });
                setChannels(formattedChannels);

                if (!activeChannel && formattedChannels.length > 0) {
                    const general = formattedChannels.find(c => c.title === 'general-discussion') || formattedChannels[0];
                    setActiveChannel(general);
                }
            }

            const dmsResponse = await fetch(`${API_URL}/direct-messages/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (dmsResponse.ok) {
                setDms(await dmsResponse.json());
            }
        } catch (error) {
            console.error("Failed to fetch channels", error);
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
                
                let url = '';
                if (activeChannel.type === 'dm') {
                    url = `${API_URL}/direct-messages/${activeChannel.id}`;
                } else {
                    url = `${API_URL}/channels/${activeChannel.id}/messages`;
                }

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
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
                            // If it's a long UUID, just say "File" unless it's an image
                            if (baseName.match(/^[0-9a-f-]{36}/i)) {
                                const ext = baseName.split('.').pop()?.toUpperCase();
                                return ext ? `${ext} File` : 'Shared File';
                            }
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
                                id: msg.senderId || msg.user_id,
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
                    setPinnedMessages(formattedMsgs.filter((m: ChatMessage) => m.isAnnouncement));

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
                            
                            // Immediately clear the unread badge visually for the active channel
                            if (activeChannel.type === 'channel') {
                                setChannels(prev => prev.map(c => c.id === activeChannel.id ? { ...c, unread: 0 } : c));
                            } else {
                                setDms(prev => prev.map(d => d.id === activeChannel.id ? { ...d, unread: 0 } : d));
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchAll();
        
        let currentEchoChannel: any;
        if (activeChannel && activeChannel.type === 'channel') {
            currentEchoChannel = echo.channel(`course-channel.${activeChannel.id}`)
                .listen('.message.created', (data: any) => {
                    const msg = data.message;
                    let file = undefined;
                    const getFileName = (m: any) => {
                        if (m.attachmentName) return m.attachmentName;
                        if (!m.attachmentUrl) return 'File';
                        const cleanUrl = m.attachmentUrl.split('?')[0];
                        const baseName = cleanUrl.split('/').pop() || 'File';
                        if (baseName.match(/^[0-9a-f-]{36}/i)) {
                            const ext = baseName.split('.').pop()?.toUpperCase();
                            return ext ? `${ext} File` : 'Shared File';
                        }
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

                    const finalMessage: ChatMessage = {
                        id: String(msg.id),
                        user: { 
                            id: msg.senderId || msg.user_id,
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
                    
                    setMessages(prev => {
                        // Avoid duplicates
                        if (!prev.find(m => m.id === finalMessage.id)) {
                            return [...prev, finalMessage];
                        }
                        return prev;
                    });
                    
                    // Instantly mark as read in local storage so background poll doesn't mark it unread
                    const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');
                    lastReadMap[activeChannel.id] = msg.id;
                    localStorage.setItem('channels_last_read', JSON.stringify(lastReadMap));
                })
                .listen('.message.deleted', (data: any) => {
                    setMessages(prev => prev.map(m => m.id === String(data.messageId) ? { ...m, isDeleted: true } : m));
                });
        }
        
        let dmEchoChannel: any;
        if (currentUser && currentUser.id) {
            dmEchoChannel = echo.private(`user.${currentUser.id}`)
                .listen('.dm.created', (data: any) => {
                    const msg = data; // The raw data sent by event
                    
                    // If we are actively chatting with the sender
                    if (activeChannel && activeChannel.type === 'dm' && String(activeChannel.id) === String(msg.senderId)) {
                        setMessages((prev: any) => {
                            if (!prev.find((m: any) => m.id === msg.id)) {
                                return [...prev, {
                                    id: msg.id,
                                    user: { 
                                        id: msg.senderId,
                                        name: msg.senderName, 
                                        role: msg.senderRole, 
                                        avatar: msg.senderName.charAt(0).toUpperCase() 
                                    },
                                    content: cleanContent(msg.content, msg.attachmentUrl),
                                    timestamp: msg.createdAt,
                                    date: 'Feed',
                                    file: msg.attachmentUrl ? {
                                        name: msg.attachmentName || (msg.attachmentUrl.split('?')[0].split('/').pop()?.match(/^[0-9a-f-]{36}/i) ? 'Shared File' : msg.attachmentUrl.split('?')[0].split('/').pop() || 'Attachment'),
                                        size: 'Linked',
                                        type: (msg.attachmentUrl.split('?')[0].match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? 'pdf' : 'other')),
                                        url: msg.attachmentUrl
                                    } : undefined,
                                    isDeleted: !!msg.isDeleted,
                                }];
                            }
                            return prev;
                        });
                        
                        // Mark instantly read in local storage
                        const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');
                        lastReadMap[`dm_${activeChannel.id}`] = msg.id;
                        localStorage.setItem('channels_last_read', JSON.stringify(lastReadMap));
                    } else {
                        // Increment unread badge dynamically without heavy polling
                        setDms(prev => {
                            let updated = false;
                            const newDms = prev.map(d => {
                                if (String(d.id) === String(msg.senderId)) {
                                    updated = true;
                                    return { ...d, unread: (d.unread || 0) + 1 };
                                }
                                return d;
                            });
                            // If sender is new (not in current list), just refresh the channel list once
                            if (!updated) setTimeout(fetchChannels, 1000); 
                            return newDms;
                        });
                    }
                })
                .listen('.dm.deleted', (data: any) => {
                    setMessages(prev => prev.map(m => m.id === String(data.messageId) ? { ...m, isDeleted: true } : m));
                });
        }

        return () => {
            if (currentEchoChannel && activeChannel) {
                echo.leave(`course-channel.${activeChannel.id}`);
            }
            if (dmEchoChannel) {
                echo.leave(`user.${currentUser?.id}`);
            }
        };
    }, [activeChannel]);

    // Global listener for background channels (Unread Counters)
    useEffect(() => {
        if (!channels.length) return;
        
        channels.forEach(c => {
            echo.channel(`course-channel.${c.id}`)
                .listen('.message.created', () => {
                    // Only increment if we're NOT currently looking at this channel
                    if (!activeChannel || activeChannel.type !== 'channel' || String(activeChannel.id) !== String(c.id)) {
                        setChannels(prev => prev.map(ch => String(ch.id) === String(c.id) ? { ...ch, unread: (ch.unread || 0) + 1 } : ch));
                    }
                });
        });

        return () => {
            channels.forEach(c => {
                // We keep the active channel listener in the main effect, but leave others if needed
                // Actually Echo handles duplicates well, but to be clean:
                if (!activeChannel || activeChannel.type !== 'channel' || String(activeChannel.id) !== String(c.id)) {
                    echo.leave(`course-channel.${c.id}`);
                }
            });
        };
    }, [channels.map(c => c.id).join(','), activeChannel?.id]);

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

    useEffect(() => {
        if (activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = async (content: string, attachment?: File) => {
        if (!content.trim() && !attachment) return;
        if (!activeChannel) return;

        let originalMessage = content.trim();
        if (isAskingQuestion) {
            originalMessage = '[QUESTION] ' + originalMessage;
        }
        
        const fileToUpload = attachment;
        const optimisticId = 'temp-' + Date.now();
        
        const tempMsg: ChatMessage = {
             id: optimisticId,
             user: { 
                 id: currentUser?.id || 'temp',
                 name: 'You', 
                 avatar: 'Y', 
                 role: 'student' 
             },
             content: fileToUpload ? (originalMessage || 'Sending file...') : originalMessage,
             timestamp: new Date().toISOString(),
             date: 'Feed',
             isAnnouncement: false,
             isQuestion: isAskingQuestion,
             isDeleted: false
        };
        setMessages(prev => [...prev, tempMsg]);

        setIsAskingQuestion(false);

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

            let url = '';
            if (activeChannel.type === 'dm') {
                url = `${API_URL}/direct-messages/${activeChannel.id}`;
            } else {
                url = `${API_URL}/channels/${activeChannel.id}/messages`;
            }

            const formData = new FormData();
            formData.append('content', originalMessage || 'Shared a file');
            formData.append('type', 'message');
            if (fileToUpload) {
                formData.append('attachment', fileToUpload);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const msg = await response.json();
                let fileDeta = undefined;
                if (msg.attachmentUrl) {
                    fileDeta = {
                        name: msg.attachmentUrl.split('/').pop() || 'Attachment',
                        size: 'Linked',
                        type: (msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'other')) as 'image' | 'pdf' | 'other',
                        url: msg.attachmentUrl
                    };
                }
                
                let displayContent = msg.content || '';
                let isQuestionFlag = false;
                if (displayContent.startsWith('[QUESTION]')) {
                    isQuestionFlag = true;
                    displayContent = displayContent.replace('[QUESTION]', '').trim();
                }

                const finalMessage: ChatMessage = {
                    id: String(msg.id),
                    user: { 
                        id: msg.senderId || msg.user_id || msg.userId,
                        name: msg.senderName, 
                        avatar: msg.senderName.charAt(0).toUpperCase(), 
                        role: msg.senderRole 
                    },
                    content: displayContent,
                    timestamp: msg.createdAt,
                    date: 'Feed',
                    isAnnouncement: msg.type === 'announcement',
                    isQuestion: isQuestionFlag,
                    file: fileDeta,
                    isDeleted: !!msg.isDeleted,
                };
                
                setMessages(prev => {
                    const alreadyExists = prev.some(m => String(m.id) === String(finalMessage.id));
                    if (alreadyExists) {
                        return prev.filter(m => m.id !== optimisticId);
                    }
                    return prev.map(m => m.id === optimisticId ? finalMessage : m);
                });
            } else {
                alert('Failed to post message.');
            }
        } catch (error) {
            console.error('Error posting message.', error);
        }
    };

    const extractSharedFiles = () => {
        return messages.filter(msg => msg.file).map(msg => ({
            ...msg.file!,
            uploadedBy: msg.user.name,
            date: msg.date,
            id: msg.id
        }));
    };

    const forceDownload = async (e: React.MouseEvent, url: string, filename: string) => {
        e.preventDefault();
        try {
            const toastId = toast.loading('Starting download...');
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            toast.dismiss(toastId);
        } catch (error) {
            console.error("Download failed, falling back to direct link", error);
            toast.dismiss();
            window.open(url, '_blank');
        }
    };

    const StatusDot = ({ status }: { status?: string }) => {
        const color = status === 'online' ? '#10b981' : status === 'away' ? '#f59e0b' : '#64748b';
        return <Circle size={10} fill={color} color={color} style={{ flexShrink: 0 }} />;
    };

    return (
        <div className="comm-module animate-fade-in-up">
            <style>{`
                .comm-module {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 120px);
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, sans-serif;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                }

                .comm-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                    gap: 1rem;
                }

                .search-bar-global {
                    flex: 1;
                    max-width: 600px;
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0 1rem;
                    transition: all 0.2s;
                }
                .search-bar-global:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .search-bar-global input {
                    border: none;
                    outline: none;
                    padding: 0.75rem;
                    width: 100%;
                    font-size: 0.9rem;
                    background: transparent;
                }

                .comm-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                /* Sub Sidebar Profile (Left Panel) */
                .sub-sidebar {
                    width: 280px;
                    background: #ffffff;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #f1f5f9;
                    flex-shrink: 0;
                    overflow-y: auto;
                }
                .sub-sidebar::-webkit-scrollbar { width: 4px; }
                .sub-sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }

                .sidebar-section {
                    padding: 1.5rem 1rem 0.5rem;
                }
                .sidebar-section h3 {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 800;
                    margin: 0 0 1rem 0.75rem;
                    color: #94a3b8;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #64748b;
                    margin-bottom: 4px;
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                    position: relative;
                }
                .nav-item:hover {
                    background: #f8fafc;
                    color: #0f172a;
                    transform: translateX(4px);
                }
                .nav-item.active {
                    background: #0f172a;
                    color: white;
                    font-weight: 700;
                    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.15);
                }
                .nav-item .truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                }

                /* Main Chat Area */
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    min-width: 0;
                    position: relative;
                }

                /* Enhanced Context Header */
                .context-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .tabs-container {
                    display: flex;
                    gap: 2rem;
                    padding: 0 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #fcfdfe;
                }
                .tab {
                    padding: 0.75rem 0;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .tab.active {
                    color: #3b82f6;
                    border-bottom-color: #3b82f6;
                }
                .tab:hover:not(.active) {
                    color: #0f172a;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                }

                .date-divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 2rem 0;
                }
                .date-divider::before, .date-divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }
                .date-divider span {
                    padding: 0 1rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }

                @media (max-width: 768px) {
                    .comm-module {
                        height: calc(100vh - 80px);
                    }
                    .sub-sidebar {
                        display: ${activeChannel ? 'none' : 'flex'};
                        width: 100%;
                    }
                    .chat-area {
                        display: ${activeChannel ? 'flex' : 'none'};
                    }
                    .search-bar-global {
                        display: none;
                    }
                }
            `}</style>

            {/* Global Top Search Bar */}
            <div className="comm-header">
                {activeChannel && (
                    <button 
                        className="md:hidden" 
                        onClick={() => setActiveChannel(null)}
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', fontWeight: 700, color: '#334155' }}
                    >
                        <Search size={20} className="md:hidden" style={{ marginRight: '8px' }} />
                        Back
                    </button>
                )}
                <div className="search-bar-global">
                    <Search size={18} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder="Search resources, lessons, and channels..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Filter size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '6px 12px', background: '#fef3c7', color: '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={16} /> Student Mode
                    </div>
                </div>
            </div>

            <div className="comm-body">
                {/* Left Panel (Internal Sidebar) */}
                <div className="sub-sidebar">
                    <div className="sidebar-section">
                        <h3>Channels</h3>
                        {channels.map(channel => (
                            <div 
                                key={channel.id} 
                                className={`nav-item ${activeChannel?.id === channel.id && activeChannel?.type === 'channel' ? 'active' : ''}`}
                                onClick={() => handleChannelSelect(channel)}
                            >
                                <Hash size={16} style={{ flexShrink: 0, color: channel.id === 'general' ? '#3b82f6' : '#94a3b8' }} />
                                <span className="truncate" style={{ fontWeight: channel.id === 'general' ? 800 : 600 }}>{channel.title}</span>
                                {channel.unread && channel.unread > 0 && !(activeChannel?.id === channel.id && activeChannel?.type === 'channel') && <span className="badge">{channel.unread}</span>}
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-section">
                        <h3>Direct Support</h3>
                        {dms.length === 0 && (
                            <div style={{ padding: '0 0.75rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                No active chats.
                            </div>
                        )}
                        {dms.map(dm => (
                            <div 
                                key={dm.id} 
                                className={`nav-item ${activeChannel?.id === dm.id && activeChannel?.type === 'dm' ? 'active' : ''}`}
                                onClick={() => handleChannelSelect(dm)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                                        {dm.avatar || dm.title.charAt(0)}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#f1f5f9', borderRadius: '50%', padding: '1px' }}>
                                        <StatusDot status={dm.status} />
                                    </div>
                                </div>
                                <span className="truncate">{dm.title}</span>
                                {dm.unread && dm.unread > 0 && !(activeChannel?.id === dm.id && activeChannel?.type === 'dm') && <span className="badge">{dm.unread}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel (Main Chat Interface) */}
                {activeChannel ? (
                    <div className="chat-area">
                        {/* Enhanced Context Header */}
                        <div className="context-header">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeChannel.type === 'channel' ? <Hash size={22} color="#64748b" /> : <StatusDot status={activeChannel.status} />}
                                        {activeChannel.title}
                                    </h2>
                                    {activeChannel.type === 'channel' && activeChannel.instructorName && (
                                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <GraduationCap size={14} /> Instructor: {activeChannel.instructorName}
                                        </span>
                                    )}
                                </div>
                                {activeChannel.description && (
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>{activeChannel.description}</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                                {activeChannel.type === 'channel' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Users size={18} /> {activeChannel.participants || '...'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs System for Learning Spaces */}
                        <div className="tabs-container">
                            <div className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                                <MessageSquare size={16} /> Course Discussion
                            </div>
                            <div className={`tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                                <BookOpen size={16} /> Shared Resources
                            </div>
                        </div>

                        {activeTab === 'chat' ? (
                            <>
                                {/* Pinned Messages Banner */}
                                {pinnedMessages.length > 0 && (
                                    <div className="pinned-banner" onClick={() => setShowPinned(!showPinned)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Pin size={16} fill="#991b1b" />
                                            <span>{pinnedMessages.length} Pinned Instructor Announcement{pinnedMessages.length > 1 ? 's' : ''}</span>
                                        </div>
                                        <span>{showPinned ? 'Hide' : 'View'}</span>
                                    </div>
                                )}

                                {showPinned && pinnedMessages.length > 0 && (
                                    <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '1rem 1.5rem' }}>
                                        {pinnedMessages.map((msg, idx) => (
                                            <div key={idx} style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', gap: '8px', fontWeight: 800, color: '#7f1d1d', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                    <AlertCircle size={14} /> {msg.user.name} - {msg.date}
                                                </div>
                                                <div style={{ color: '#450a0a', fontSize: '0.9rem' }}>{msg.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Chat Messages */}
                                <div className="chat-messages">
                                    {isLoadingMessages ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
                                            <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto 1.5rem' }} />
                                            <p style={{ margin: '0', fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                <BookOpen size={32} color="#cbd5e1" />
                                            </div>
                                            <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>
                                                No messages yet.
                                            </h2>
                                            <p style={{ margin: '0', fontSize: '1rem', color: '#94a3b8' }}>
                                                Waiting for your instructor to initiate the conversation...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg, index) => {
                                                const showDate = index === 0 || formatDateDivider(msg.timestamp) !== formatDateDivider(messages[index - 1].timestamp);
                                                
                                                const premiumMsg: Message = {
                                                    id: msg.id,
                                                    senderName: msg.user.name,
                                                    senderRole: msg.user.role,
                                                    type: msg.isAnnouncement ? 'announcement' : 'message',
                                                    content: msg.content,
                                                    attachmentUrl: msg.file?.url,
                                                    createdAt: formatTime(msg.timestamp)
                                                };

                                                return (
                                                    <React.Fragment key={msg.id}>
                                                        {showDate && (
                                                            <div className="date-divider">
                                                                <span>{formatDateDivider(msg.timestamp)}</span>
                                                            </div>
                                                        )}
                                                        <MessageCard message={premiumMsg} viewerRole="student" />
                                                    </React.Fragment>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="chat-input-container">
                                    {isAskingQuestion && (
                                        <div style={{ background: '#fef3c7', padding: '10px 1.5rem', borderTop: '1px solid #fde68a', color: '#b45309', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HelpCircle size={16} /> YOU ARE IN QUESTION MODE (HIGHLIGHTED)</div>
                                            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setIsAskingQuestion(false)} />
                                        </div>
                                    )}
                                    <ChatInput 
                                        onSendMessage={handleSendMessage} 
                                        placeholder={isAskingQuestion ? "Ask your question to the instructor..." : "Message the class..."}
                                    />
                                    <div style={{ background: 'white', padding: '0 1.5rem 1rem', display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => setIsAskingQuestion(!isAskingQuestion)}
                                            style={{ background: isAskingQuestion ? '#fef3c7' : '#f1f5f9', border: 'none', cursor: 'pointer', color: isAskingQuestion ? '#b45309' : '#64748b', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.75rem', transition: 'all 0.2s' }}
                                        >
                                            <HelpCircle size={16} /> {isAskingQuestion ? 'Question Mode Active' : 'Need Help? Ask a Question'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="resources-grid">
                                {extractSharedFiles().length > 0 ? (
                                    extractSharedFiles().map(file => (
                                        <div key={file.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {file.type === 'pdf' ? <FileText size={24} /> : file.type === 'image' ? <ImageIcon size={24} /> : <FileGeneric size={24} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>{file.name}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{file.size} • {file.type.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Shared by: <strong>{file.uploadedBy}</strong></span>
                                                <span>{file.date}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                                <button onClick={() => window.open(file.url, '_blank')} style={{ flex: 1, background: '#f1f5f9', border: 'none', color: '#0f172a', padding: '8px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                                    Preview
                                                </button>
                                                <button onClick={(e) => forceDownload(e, file.url, file.name || 'Resource')} style={{ flex: 1, background: '#3b82f6', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                                    <Download size={16} /> Download
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                        <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                            <FileGeneric size={32} color="#94a3b8" />
                                        </div>
                                        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#0f172a' }}>No Files Shared Yet</h3>
                                        <p style={{ margin: 0 }}>Resources shared in the chat will automatically appear here for easy access.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', color: '#94a3b8' }}>
                        <Hash size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ margin: 0, fontWeight: 800, color: '#64748b' }}>No Channel Selected</h3>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Choose your enrolled course channel to start learning.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentChannelsPage;
