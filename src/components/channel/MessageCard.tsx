import { useState } from 'react';
import { Download, FileAudio, Eye, X, FileText, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export interface Message {
    id: string;
    senderName: string;
    senderRole: 'instructor' | 'student';
    type: 'message' | 'announcement' | 'assignment';
    content: string;
    attachmentUrl?: string;
    dueDate?: string;
    createdAt: string;
}

interface MessageCardProps {
    message: Message;
    viewerRole?: 'instructor' | 'student';
    onDelete?: () => Promise<void>;
    onEdit?: (newContent: string) => Promise<void>;
    isMine?: boolean;
    compact?: boolean;
}

const MessageCard = ({ message, viewerRole, onDelete, onEdit, isMine = false, compact = false }: MessageCardProps) => {
    const isInstructor = message.senderRole === 'instructor';
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isSaving, setIsSaving] = useState(false);

    const isPdf = (url: string) => {
        return /\.pdf(\?.*)?$/i.test(url.split('?')[0]);
    };

    const handleViewPdf = (e: React.MouseEvent, url: string, title?: string) => {
        if (viewerRole === 'student' && isPdf(url)) {
            e.preventDefault();
            setViewingPdf({ url, title: title || 'Resource Archive' });
        }
    };

    return (
        <div className={`slack-message-row ${compact ? 'compact' : ''} ${message.type === 'announcement' ? 'is-announcement' : ''} ${isMine ? 'is-mine' : ''}`}>
            <style>{`
                .slack-message-row {
                    display: flex;
                    gap: 12px;
                    padding: ${compact ? '4px 24px' : '8px 24px'};
                    position: relative;
                    margin-top: ${compact ? '0' : '8px'};
                    background: transparent;
                }
                .slack-message-row:hover {
                    background-color: #f8fafc;
                }
                
                .message-avatar-sidebar {
                    width: 44px;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: center;
                    position: relative;
                }
                .avatar-img-circle {
                    width: 42px;
                    height: 42px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: white;
                    font-size: 1rem;
                    background: ${isInstructor ? '#1e1b4b' : '#334155'};
                }

                .avatar-timestamp-on-hover {
                    position: absolute;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    opacity: 0;
                    width: 100%;
                    text-align: right;
                    right: 0;
                    top: 2px;
                    user-select: none;
                }
                .slack-message-row:hover .avatar-timestamp-on-hover {
                    opacity: 1;
                }

                .message-main-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .message-upper-meta {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 2px;
                }
                .sender-displayName {
                    font-weight: 900;
                    color: #1e293b;
                    font-size: 0.95rem;
                }
                .instructor-badge-premium {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .timestamp-minimal {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .message-body-text {
                    font-size: 0.95rem;
                    color: #334155;
                    line-height: 1.5;
                    word-wrap: break-word;
                    width: 100%;
                }
                
                .message-body-text p {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                .message-body-text p:last-child {
                    margin-bottom: 0;
                }
                .message-body-text a {
                    color: #2563eb;
                    text-decoration: none;
                }
                .message-body-text a:hover {
                    text-decoration: underline;
                }
                .message-body-text ul, .message-body-text ol {
                    margin-top: 4px;
                    margin-bottom: 8px;
                    padding-left: 20px;
                }
                .message-body-text blockquote {
                    border-left: 3px solid #cbd5e1;
                    margin: 4px 0 8px 0;
                    padding-left: 12px;
                    color: #475569;
                    font-style: italic;
                }
                .message-body-text code {
                    background: #f1f5f9;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    font-family: monospace;
                    color: #ef4444;
                }
                .message-body-text pre {
                    background: #0f172a;
                    padding: 12px;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 8px 0;
                }
                .message-body-text pre code {
                    background: transparent;
                    color: #f8fafc;
                    padding: 0;
                }
                
                .is-announcement .message-body-text {
                    padding: 8px 12px;
                    background: #fffafa;
                    border-left: 4px solid #ef4444;
                    border-radius: 4px;
                    color: #7f1d1d;
                }

                .message-attachment-container {
                    margin-top: 8px;
                    max-width: 100%;
                }
                .image-attachment-preview img {
                    max-width: 360px;
                    max-height: 240px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                }

                .audio-attachment-pill {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 8px 16px;
                    border-radius: 30px;
                    max-width: fit-content;
                }
                
                .generic-file-attachment {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #0f172a;
                    max-width: 350px;
                    transition: all 0.2s;
                }
                .generic-file-attachment:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                .message-actions-hover {
                    position: absolute;
                    right: 24px;
                    top: -12px;
                    opacity: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    transition: opacity 0.15s;
                    z-index: 10;
                }
                .slack-message-row:hover .message-actions-hover {
                    opacity: 1;
                }
                .action-btn {
                    padding: 6px 8px;
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .action-btn.delete:hover {
                    color: #ef4444;
                    background: #fef2f2;
                }
            `}</style>
            
            <div className="message-avatar-sidebar">
                {!compact ? (
                    <div className="avatar-img-circle">
                        {message.senderName.charAt(0)}
                    </div>
                ) : (
                    <div className="avatar-timestamp-on-hover">
                        {message.createdAt.replace(/ AM| PM/, "").split(':')[0] + ':' + message.createdAt.split(':')[1]}
                    </div>
                )}
            </div>
            
            <div className="message-main-content">
                {!compact && (
                    <div className="message-upper-meta">
                        <span className="sender-displayName">{message.senderName}</span>
                        {isInstructor && <span className="instructor-badge-premium">Instructor</span>}
                        {message.type === 'announcement' && <span className="instructor-badge-premium" style={{background:'#fee2e2', color:'#b91c1c'}}>Announcement</span>}
                        <span className="timestamp-minimal">{message.createdAt}</span>
                    </div>
                )}

                {isEditing ? (
                    <div style={{ width: '100%', marginTop: '4px' }}>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                color: '#1e293b',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button 
                                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                                style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    if(onEdit) {
                                        setIsSaving(true);
                                        await onEdit(editContent);
                                        setIsSaving(false);
                                        setIsEditing(false);
                                    }
                                }}
                                style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                disabled={isSaving || editContent.trim() === message.content}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="message-body-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {message.attachmentUrl && (message.type === 'message' || message.type === 'announcement') && (
                    <div className="message-attachment-container">
                        {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="image-attachment-preview" style={{position: 'relative', display: 'inline-block'}}>
                                <img src={message.attachmentUrl} alt="Attachment" loading="lazy" />
                                <a href={message.attachmentUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)', fontWeight: 600 }}>
                                    <Eye size={14}/> View Full
                                </a>
                            </div>
                        ) : /\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="audio-attachment-pill">
                                <FileAudio size={20} color="#64748b" />
                                <audio controls src={message.attachmentUrl} style={{ height: '32px' }} />
                            </div>
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="generic-file-attachment"
                                onClick={(e) => handleViewPdf(e, message.attachmentUrl!, 'Attachment')}
                            >
                                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Download size={20} color="#3b82f6" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                                        {message.attachmentUrl.split('/').pop()?.split('?')[0] || 'Attachment'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                        {viewerRole === 'student' && isPdf(message.attachmentUrl) ? 'Secure PDF Document' : 'Click to download'}
                                    </span>
                                </div>
                            </a>
                        )}
                    </div>
                )}
            </div>
            
            <div className="message-actions-hover">
                {onEdit && (
                    <button 
                        className="action-btn"
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        title="Edit Message"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                )}
                {onDelete && (
                    <button 
                        className="action-btn delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        title="Delete Message"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Secure PDF Viewer Modal for Messaging */}
            {viewingPdf && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: 'rgba(2, 6, 23, 0.9)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        background: 'white',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '92vh',
                        position: 'relative',
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{
                            padding: '1.5rem 2.5rem',
                            borderBottom: '1.5px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fcfdfe'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ padding: '10px', borderRadius: '14px', background: '#f0fdf4' }}>
                                    <FileText size={22} color="#1a4d3e" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em' }}>{viewingPdf?.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure PDF Viewer • Download Disabled</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewingPdf(null); }}
                                style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div
                            style={{ flex: 1, background: '#f8fafc', overflow: 'hidden', position: 'relative' }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <iframe
                                src={viewingPdf ? `${viewingPdf.url}#toolbar=0&navpanes=0` : ''}
                                style={{ width: '100%', height: '70vh', border: 'none' }}
                                title="Secure PDF Viewer"
                            />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'transparent' }}></div>
                        </div>

                        <div style={{ padding: '1rem 2.5rem', background: '#fcfdfe', borderTop: '1.5px solid #f1f5f9', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Protected by Layos Group Security Protocol</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageCard;
