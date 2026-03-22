import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Search, Hash, Users, Circle, Trash2,
    Send, Paperclip, Smile, Download, Image as ImageIcon, 
    FileText, Plus, MessageSquare, Filter, X, Info, File as FileGeneric, Check,
    Megaphone, Layout, Play, Lightbulb, Loader2
} from 'lucide-react';
import echo from '../../utils/echo';
import EmojiPicker from 'emoji-picker-react';

interface Channel {
    id: string;
    title: string;
    unread?: number;
    type: 'channel' | 'dm';
    status?: 'online' | 'offline' | 'away';
    avatar?: string;
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
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Announcement Modal State
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');

    // DM Search State
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Channel[]>([]);
    
    // Create Channel State
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [targetCourseId, setTargetCourseId] = useState<string>('general');
    const [instructorCourses, setInstructorCourses] = useState<any[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            
            // 1. Fetch Backend Channels
            const channelsResponse = await fetch(`${API_URL}/course-channels`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let dbChannels: any[] = [];
            if (channelsResponse.ok) {
                dbChannels = await channelsResponse.json();
            }

            // 2. Fetch Instructor's Cohorts (to know which courses they can add channels to)
            const cohortsResponse = await fetch(`${API_URL}/cohorts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (cohortsResponse.ok) {
                const cohorts = await cohortsResponse.json();
                setInstructorCourses(cohorts.map((c: any) => c.course).filter(Boolean));
            }

            const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');

            // Map DB channels to UI
            const formattedChannels: Channel[] = dbChannels.map((c: any) => {
                const channelIdStr = c.id.toString();
                const lastReadId = lastReadMap[channelIdStr];
                const isUnread = c.latest_message_id && lastReadId !== c.latest_message_id;

                return {
                    id: channelIdStr,
                    title: c.name,
                    type: 'channel',
                    courseId: c.course_id,
                    unread: isUnread ? 1 : 0
                };
            });

            setChannels(formattedChannels);

            if (!activeChannel && formattedChannels.length > 0) {
                const general = formattedChannels.find(c => c.title === 'general-discussion') || formattedChannels[0];
                setActiveChannel(general);
            }

            // 3. Fetch DM Contacts
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

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) {
            toast.error('Channel name is required');
            return;
        }
        
        setIsCreatingChannel(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            
            const response = await fetch(`${API_URL}/course-channels/${targetCourseId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newChannelName,
                    description: newChannelDesc
                })
            });

            if (response.ok) {
                toast.success('Channel created successfully');
                setIsCreateChannelModalOpen(false);
                setNewChannelName('');
                setNewChannelDesc('');
                fetchChannels();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to create channel');
            }
        } catch (error) {
            console.error("Failed to create channel", error);
            toast.error('A network error occurred');
        } finally {
            setIsCreatingChannel(false);
        }
    };

    const handleDeleteChannel = async () => {
        if (!activeChannel || activeChannel.type !== 'channel') return;
        
        if (!window.confirm(`Are you sure you want to delete the channel #${activeChannel.title}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            
            const response = await fetch(`${API_URL}/course-channels/${activeChannel.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Channel deleted successfully');
                setActiveChannel(null);
                fetchChannels();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to delete channel');
            }
        } catch (error) {
            console.error("Failed to delete channel", error);
            toast.error('A network error occurred');
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
                    // It's a real Channel ID from DB
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
                        return {
                            id: String(msg.id),
                            user: { 
                                id: msg.userId || msg.user_id || msg.senderId,
                                name: msg.senderName, 
                                avatar: msg.senderName.charAt(0).toUpperCase(), 
                                role: msg.senderRole 
                            },
                            content: cleanContent(msg.content, msg.attachmentUrl),
                            timestamp: msg.createdAt,
                            date: 'Feed',
                            isAnnouncement: msg.type === 'announcement',
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
        
        // Listen to WebSocket for real-time messages on active channel
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

                    const finalMessage: ChatMessage = {
                        id: String(msg.id),
                        user: { 
                            id: msg.userId || msg.user_id || msg.senderId,
                            name: msg.senderName, 
                            avatar: msg.senderName.charAt(0).toUpperCase(), 
                            role: msg.senderRole 
                        },
                        content: cleanContent(msg.content, msg.attachmentUrl),
                        timestamp: msg.createdAt,
                        date: 'Feed',
                        isAnnouncement: msg.type === 'announcement',
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
                    const msg = data; 
                    
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
                                    isDeleted: !!msg.isDeleted,
                                    file: msg.attachmentUrl ? {
                                        name: msg.attachmentName || (msg.attachmentUrl.split('?')[0].split('/').pop()?.match(/^[0-9a-f-]{36}/i) ? 'Shared File' : msg.attachmentUrl.split('?')[0].split('/').pop() || 'Attachment'),
                                        size: 'Linked',
                                        type: (msg.attachmentUrl.split('?')[0].match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : (msg.attachmentUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? 'pdf' : 'other')),
                                        url: msg.attachmentUrl
                                    } : undefined
                                }];
                            }
                            return prev;
                        });
                        
                        // Mark instantly read in local storage
                        const lastReadMap = JSON.parse(localStorage.getItem('channels_last_read') || '{}');
                        lastReadMap[`dm_${activeChannel.id}`] = msg.id;
                        localStorage.setItem('channels_last_read', JSON.stringify(lastReadMap));
                    } else {
                        // Increment unread badge dynamically
                        setDms(prev => {
                            return prev.map(d => {
                                if (String(d.id) === String(msg.senderId)) {
                                    return { ...d, unread: (d.unread || 0) + 1 };
                                }
                                return d;
                            });
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
                    if (!activeChannel || activeChannel.type !== 'channel' || String(activeChannel.id) !== String(c.id)) {
                        setChannels(prev => prev.map(ch => String(ch.id) === String(c.id) ? { ...ch, unread: (ch.unread || 0) + 1 } : ch));
                    }
                });
        });

        return () => {
            channels.forEach(c => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            
            let url = '';
            if (activeChannel?.type === 'dm') {
                url = `${API_URL}/direct-messages/${activeChannel.id}/${messageId}`;
            } else {
                url = `${API_URL}/channel-messages/${messageId}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
                toast.success('Message deleted');
            } else {
                toast.error('Failed to delete message');
            }
        } catch (error) {
            console.error('Delete error', error);
            toast.error('Error deleting message');
        }
    };

    const handleSendMessage = async (msgType: 'message' | 'announcement' = 'message', overrideContent?: string) => {
        const finalContent = overrideContent || inputValue;
        if (!finalContent.trim() && !selectedFile) return;
        if (!activeChannel) return;

        const originalMessage = finalContent;
        const fileToUpload = selectedFile;
        const optimisticId = 'temp-' + Date.now();

        const tempMsg: ChatMessage = {
             id: optimisticId,
             user: { 
                 id: currentUser?.id || 'temp',
                 name: 'You', 
                 avatar: 'Y', 
                 role: 'instructor' 
             },
             content: fileToUpload ? (originalMessage || 'Sending file...') : originalMessage,
             timestamp: new Date().toISOString(),
             date: 'Feed',
             isAnnouncement: msgType === 'announcement',
             isDeleted: false
        };
        setMessages(prev => [...prev, tempMsg]);

        // Reset inputs
        if (!overrideContent) setInputValue('');
        setSelectedFile(null);
        setUploadProgress(0);
        setShowEmojiPicker(false);

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
            formData.append('type', msgType);
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

                const finalMessage: ChatMessage = {
                    id: String(msg.id),
                    user: { 
                        id: msg.userId || msg.user_id || msg.senderId,
                        name: msg.senderName, 
                        avatar: msg.senderName.charAt(0).toUpperCase(), 
                        role: msg.senderRole 
                    },
                    content: msg.content,
                    timestamp: msg.createdAt || 'Just now',
                    date: 'Feed',
                    isAnnouncement: msg.type === 'announcement',
                    isDeleted: !!msg.isDeleted,
                    file: fileDeta
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                alert('File size exceeds 100MB limit.');
                return;
            }
            setSelectedFile(file);
            setUploadProgress(100);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    background: #f8fafc; /* Light modern gray to match instructor theme */
                    color: #475569;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #e2e8f0;
                    flex-shrink: 0;
                    overflow-y: auto;
                }
                .sub-sidebar::-webkit-scrollbar { width: 6px; }
                .sub-sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

                .sidebar-section {
                    padding: 1.5rem 1rem 0.5rem;
                }
                .sidebar-section h3 {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 800;
                    margin: 0 0 0.75rem 0.5rem;
                    color: #64748b;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0.6rem 0.85rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #475569;
                    margin-bottom: 4px;
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                .nav-item:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .nav-item.active {
                    background: #3b82f6;
                    color: white;
                    font-weight: 700;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
                }
                .nav-item .truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                }
                .status-dot-wrapper {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background: #f8fafc;
                    border-radius: 50%;
                    padding: 1px;
                    transition: all 0.2s;
                }
                .nav-item:hover .status-dot-wrapper {
                    background: #e2e8f0;
                }
                .nav-item.active .status-dot-wrapper {
                .badge {
                    background: #ef4444;
                    color: white;
                    font-size: 0.72rem;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 20px;
                    margin-left: auto;
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                /* Main Chat Area */
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    min-width: 0;
                }

                .chat-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                }
                .chat-header-title {
                    font-weight: 800;
                    font-size: 1.1rem;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
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

                .message-item {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .message-item:hover {
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .message-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                .message-content {
                    flex: 1;
                }
                .message-header {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                .message-user {
                    font-weight: 800;
                    color: #0f172a;
                    font-size: 0.95rem;
                }
                .message-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 600;
                }
                .message-text {
                    color: #334155;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                .instructor-message {
                    background: #f8fafc;
                    padding: 0.75rem;
                    border-radius: 12px;
                    border-left: 3px solid #0f172a;
                    margin-left: -0.75rem;
                    margin-right: -0.75rem;
                }

                .announcement-message {
                    border: 1px solid #fee2e2;
                    background: #fffafa;
                    border-left: 4px solid #ef4444;
                }

                .announcement-message .message-user {
                    color: #b91c1c;
                }


                /* File Attachment display */
                .file-attachment {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-top: 0.5rem;
                    background: #f8fafc;
                    max-width: 400px;
                    transition: all 0.2s;
                }
                .file-attachment:hover {
                    border-color: #cbd5e1;
                    background: white;
                }
                .file-icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: #eff6ff;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Input Area */
                .chat-input-container {
                    padding: 0 1.5rem 1.5rem;
                    background: white;
                }
                .chat-input-wrapper {
                    border: 1.5px solid #e2e8f0;
                    border-radius: 16px;
                    background: #fcfdfe;
                    padding: 0.5rem;
                    transition: all 0.2s;
                }
                .chat-input-wrapper:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
                    background: white;
                }
                .file-preview-strip {
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border-bottom: 1px solid #e2e8f0;
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
                        display: none; /* Hide on small screens or move to toggle */
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Global Top Search Bar */}
            <div className="comm-header">
                {activeChannel && (
                    <button 
                        className="md:hidden" 
                        onClick={() => setActiveChannel(null)}
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center' }}
                    >
                        <Search size={20} className="md:hidden" style={{ marginRight: '8px' }} />
                        Back
                    </button>
                )}
                <div className="search-bar-global">
                    <Search size={18} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder="Search messages, files, and channels..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Filter size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <div className="comm-body">
                {/* Left Panel (Internal Sidebar) */}
                <div className="sub-sidebar">
                    <div className="sidebar-section">
                        <h3>Channels <Plus size={16} style={{ cursor: 'pointer', color: '#64748b', background: '#e2e8f0', borderRadius: '4px', padding: '2px' }} onClick={() => setIsCreateChannelModalOpen(true)} /></h3>
                        {channels.map(channel => (
                            <div 
                                key={channel.id} 
                                className={`nav-item ${activeChannel?.id === channel.id && activeChannel?.type === 'channel' ? 'active' : ''}`}
                                onClick={() => handleChannelSelect(channel)}
                            >
                                <Hash size={18} />
                                <span className="truncate">{channel.title}</span>
                                {channel.unread && channel.unread > 0 && !(activeChannel?.id === channel.id && activeChannel?.type === 'channel') && <span className="badge">{channel.unread}</span>}
                            </div>
                        ))}
                    </div>

                    {/* Direct Messages Section */}
                    <div className="sidebar-section">
                        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Direct Messages 
                            <Plus 
                                size={16} 
                                style={{ cursor: 'pointer', color: '#64748b', background: '#e2e8f0', borderRadius: '4px', padding: '2px' }} 
                                onClick={() => setIsUserSearchOpen(true)}
                            />
                        </h3>
                        {dms.length === 0 && (
                            <div style={{ padding: '0 0.75rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                No active chats. Click + to start.
                            </div>
                        )}
                        {dms.map(dm => (
                            <div 
                                key={dm.id} 
                                className={`nav-item ${activeChannel?.id === dm.id && activeChannel?.type === 'dm' ? 'active' : ''}`}
                                onClick={() => handleChannelSelect(dm)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                                        {dm.avatar || dm.title.charAt(0)}
                                    </div>
                                    <div className="status-dot-wrapper">
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
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-title">
                                {activeChannel.type === 'channel' ? <Hash size={20} color="#64748b" /> : <StatusDot status={activeChannel.status} />}
                                {activeChannel.title}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', color: '#64748b', alignItems: 'center' }}>
                                {activeChannel.type === 'channel' && <Users size={20} style={{ cursor: 'pointer' }} />}
                                <Info size={20} style={{ cursor: 'pointer' }} />
                                {activeChannel.type === 'channel' && activeChannel.title !== 'general-discussion' && (
                                    <button 
                                        onClick={handleDeleteChannel}
                                        style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px', transition: 'all 0.2s', marginLeft: '4px' }}
                                        title="Delete Channel"
                                        onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        {/* Chat Messages */}
                        <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column' }}>
                            {messages.length === 0 ? (
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    <div style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        background: 'white', 
                                        borderRadius: '24px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        marginBottom: '1.5rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Megaphone size={40} color="#3b82f6" />
                                    </div>
                                    <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900, fontSize: '1.8rem', color: '#0f172a' }}>
                                        Start the conversation
                                    </h2>
                                    <p style={{ margin: '0 0 2.5rem', fontSize: '1.05rem', color: '#64748b', maxWidth: '450px', lineHeight: 1.6 }}>
                                        This channel is empty. As the instructor, you can kick things off by sharing a welcome message, uploading course materials, or posting an announcement.
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
                                        <button 
                                            onClick={() => inputRef.current?.focus()}
                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                        >
                                            <Send size={18} /> Send First Message
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                        >
                                            <Paperclip size={18} /> Upload Resource
                                        </button>
                                        <button 
                                            onClick={() => setIsAnnouncementModalOpen(true)}
                                            style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fee2e2', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                        >
                                            <Megaphone size={18} /> Post Announcement
                                        </button>
                                    </div>

                                    <div style={{ width: '100%', maxWidth: '600px' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 800 }}>Quick Start Templates</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                                            {[
                                                { icon: <Layout size={16} />, text: "Welcome to the course! I'm excited to start this journey with you all." },
                                                { icon: <Play size={16} />, text: "Our first live session is scheduled for tomorrow. Please review the prep materials." },
                                                { icon: <Lightbulb size={16} />, text: "I've just uploaded the syllabus and initial resource pack for Module 1." },
                                                { icon: <Check size={16} />, text: "Drop a quick 'Hi' here so I know everyone has successfully joined the channel!" }
                                            ].map((tpl, i) => (
                                                <div 
                                                    key={i}
                                                    onClick={() => setInputValue(tpl.text)}
                                                    style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', transition: 'border-color 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                >
                                                    <span style={{ color: '#3b82f6' }}>{tpl.icon}</span>
                                                    <span className="truncate">{tpl.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : isLoadingMessages ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 2rem' }}>
                                    <Loader2 size={48} className="animate-spin" style={{ color: '#0f172a', margin: '0 auto 1.5rem' }} />
                                    <p style={{ margin: '0', fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Loading messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: 'auto', padding: '2rem' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        {activeChannel.type === 'channel' ? <Hash size={30} color="#0f172a" /> : <MessageSquare size={30} color="#0f172a" />}
                                    </div>
                                    <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>
                                        Welcome to {activeChannel.type === 'channel' ? '#' : ''}{activeChannel.title}!
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>This is the start of your communication history.</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => {
                                        const showDate = index === 0 || formatDateDivider(msg.timestamp) !== formatDateDivider(messages[index - 1].timestamp);
                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDate && (
                                                    <div className="date-divider">
                                                        <span>{formatDateDivider(msg.timestamp)}</span>
                                                    </div>
                                                )}
                                                <div className={`message-item ${msg.user.role === 'instructor' ? 'message-instructor' : ''} ${msg.isAnnouncement ? 'message-instructor' : ''}`}>
                                                    <div className={`message-avatar ${msg.user.role === 'instructor' ? 'avatar-instructor' : ''}`}>
                                                        {msg.user.avatar}
                                                    </div>
                                                            <div className="message-content">
                                                                <div className="message-header">
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span className="message-user">{msg.user.name}</span>
                                                                        <span className={`role-badge ${msg.user.role === 'instructor' ? 'badge-instructor' : 'badge-student'}`}>
                                                                            {msg.user.role === 'instructor' ? 'Instructor' : 'Student'}
                                                                        </span>
                                                                        {msg.isAnnouncement && <span className="role-badge badge-announcement">Announcement</span>}
                                                                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                                                                        
                                                                        {/* Delete Action (Instructor can delete anyone, Student can only their own if they were here) */}
                                                                        {!msg.isDeleted && (
                                                                            <button 
                                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8', opacity: 0.5 }}
                                                                                className="hover:text-red-500 hover:opacity-100 transition-all"
                                                                                title="Delete message"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {msg.isDeleted ? (
                                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', padding: '4px 0' }}>
                                                                        This message has been deleted
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="message-text">
                                                                            {msg.content}
                                                                        </div>
                                                                        
                                                                        {msg.file && (
                                                                            <div key={msg.file.url}>
                                                                                {msg.file.type === 'image' ? (
                                                                                    <div style={{ marginTop: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', width: 'fit-content', background: '#f8fafc' }}>
                                                                                        <img src={msg.file.url} alt="Attachment" style={{ display: 'block', maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                                                                                        <div style={{ padding: '8px 12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
                                                                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={14} /> Image Attachment</div>
                                                                                             <a title="Download Image" href={msg.file.url} onClick={(e) => forceDownload(e, msg.file!.url, msg.file!.name || 'image')} style={{ cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', padding: '6px', background: '#eff6ff', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#dbeafe'} onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}>
                                                                                                 <Download size={16} />
                                                                                             </a>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                     <a href={msg.file.url} onClick={(e) => forceDownload(e, msg.file!.url, msg.file!.name || 'document')} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: 'fit-content' }}>
                                                                                         <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', width: 'fit-content', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: msg.file.type === 'pdf' ? '#fee2e2' : '#e0e7ff', color: msg.file.type === 'pdf' ? '#ef4444' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                <FileText size={20} />
                                                                                            </div>
                                                                                            <div style={{ paddingRight: '12px' }}>
                                                                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>{msg.file.name}</div>
                                                                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Click to download</div>
                                                                                            </div>
                                                                                            <div style={{ marginLeft: 'auto', padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                                                                <Download size={16} color="#64748b" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                        );
                                    })}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-container">
                            <div className="chat-input-wrapper">
                                {selectedFile && (
                                    <div className="file-preview-strip">
                                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                                            <FileGeneric size={16} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {selectedFile.name}
                                            </div>
                                            {uploadProgress < 100 ? (
                                                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '4px' }}>
                                                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3b82f6', borderRadius: '2px', transition: 'width 0.2s' }}></div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <Check size={12} /> Uploaded successfully
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                
                                <textarea 
                                    ref={inputRef}
                                    style={{
                                        width: '100%', border: 'none', outline: 'none', resize: 'none', padding: '0.75rem', 
                                        fontFamily: 'inherit', fontSize: '0.95rem', minHeight: '60px', maxHeight: '200px', background: 'transparent'
                                    }}
                                    placeholder={activeChannel.type === 'channel' ? `Message #${activeChannel.title}` : `Message ${activeChannel.title}`}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '6px' }}
                                            title="Attach file (Max 100MB)"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            style={{ background: showEmojiPicker ? '#e2e8f0' : 'none', border: 'none', cursor: 'pointer', color: showEmojiPicker ? '#0f172a' : '#64748b', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }}
                                            title="Add Emoji"
                                        >
                                            <Smile size={18} />
                                        </button>

                                        {showEmojiPicker && (
                                            <div style={{ position: 'absolute', bottom: '100%', left: '40px', marginBottom: '8px', zIndex: 100, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                                                <EmojiPicker 
                                                    onEmojiClick={(e) => {
                                                        setInputValue(prev => prev + e.emoji);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            style={{ display: 'none' }} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputValue.trim() && !selectedFile}
                                        style={{ 
                                            background: (inputValue.trim() || selectedFile) ? '#3b82f6' : '#f1f5f9', 
                                            color: (inputValue.trim() || selectedFile) ? 'white' : '#94a3b8', 
                                            border: 'none', 
                                            cursor: (inputValue.trim() || selectedFile) ? 'pointer' : 'not-allowed', 
                                            padding: '8px 16px', 
                                            borderRadius: '8px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {(inputValue.trim() || selectedFile) ? <><Send size={16} /> Send</> : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <Hash size={40} color="#cbd5e1" />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 900, color: '#0f172a', fontSize: '1.5rem' }}>No Channel Selected</h3>
                        <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#64748b', maxWidth: '350px', lineHeight: 1.6 }}>
                            {channels.length === 0 
                                ? "You haven't been assigned to any courses yet. Once assigned, your class channels will appear in the sidebar." 
                                : "Select a discussion channel or a direct message from the sidebar to begin communicating."}
                        </p>
                        {channels.length > 0 && (
                            <button 
                                onClick={() => setActiveChannel(channels[0])}
                                style={{ marginTop: '1.5rem', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Open General Channel
                            </button>
                        )}
                    </div>
                )}
            </div>            {/* Announcement Modal */}
            {isAnnouncementModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Post Announcement</h3>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsAnnouncementModalOpen(false)} />
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Title</label>
                                <input 
                                    type="text" 
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Content</label>
                                <textarea 
                                    value={announcementContent}
                                    onChange={(e) => setAnnouncementContent(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '120px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setIsAnnouncementModalOpen(false)} style={{ flex: 1, border: 'none', background: '#f1f5f9', padding: '0.75rem', borderRadius: '10px' }}>Cancel</button>
                                <button 
                                    onClick={() => handleSendMessage('announcement', announcementTitle + ": " + announcementContent)}
                                    style={{ flex: 2, border: 'none', background: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '10px' }}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Search Modal for DMs */}
            {isUserSearchOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>New Message</h3>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsUserSearchOpen(false)} />
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..."
                                    value={userSearchQuery}
                                    onChange={async (e) => {
                                        setUserSearchQuery(e.target.value);
                                        if (e.target.value.length >= 2) {
                                            const token = localStorage.getItem('token');
                                            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                                            const res = await fetch(`${API_URL}/direct-messages/search?q=${e.target.value}`, {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            if (res.ok) setSearchResults(await res.json());
                                        } else {
                                            setSearchResults([]);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {searchResults.map(user => (
                                    <div 
                                        key={user.id}
                                        onClick={() => {
                                            setActiveChannel(user);
                                            setDms(prev => prev.find(d => d.id === user.id) ? prev : [user, ...prev]);
                                            setIsUserSearchOpen(false);
                                            setUserSearchQuery('');
                                            setSearchResults([]);
                                        }}
                                        style={{ padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                    >
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {user.title.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700 }}>{user.title}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{user.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Channel Modal */}
            {isCreateChannelModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>Create Channel</h2>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Set up a new space for discussion.</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateChannelModalOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channel Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Hash size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. assignment-help"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\\s+/g, '-'))}
                                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc', fontWeight: 600, color: '#0f172a', transition: 'all 0.2s', outline: 'none' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'white'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description (Optional)</label>
                            <textarea 
                                placeholder="What is this channel about?"
                                value={newChannelDesc}
                                onChange={(e) => setNewChannelDesc(e.target.value)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc', minHeight: '100px', resize: 'none', transition: 'all 0.2s', outline: 'none' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'white'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                            />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Association</label>
                            <select 
                                value={targetCourseId}
                                onChange={(e) => setTargetCourseId(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc', fontWeight: 600, color: '#0f172a', cursor: 'pointer', outline: 'none', appearance: 'none' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'white'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <option value="general">Global (Visible to Everyone)</option>
                                {instructorCourses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => setIsCreateChannelModalOpen(false)} 
                                disabled={isCreatingChannel}
                                style={{ flex: 1, border: 'none', background: '#f1f5f9', color: '#475569', padding: '1rem', borderRadius: '12px', fontWeight: 800, cursor: isCreatingChannel ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateChannel}
                                disabled={isCreatingChannel || !newChannelName.trim()}
                                style={{ flex: 2, border: 'none', background: (!newChannelName.trim() || isCreatingChannel) ? '#94a3b8' : '#3b82f6', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 800, cursor: (!newChannelName.trim() || isCreatingChannel) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: (!newChannelName.trim() || isCreatingChannel) ? 'none' : '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                            >
                                {isCreatingChannel ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Creating...
                                    </>
                                ) : (
                                    'Create Channel'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorChannelsPage;
