import { useState, useRef, useEffect } from 'react';
import { Download, FileAudio, Eye, X, FileText, Trash2, Bold, Italic, Underline, CornerUpLeft, MessageSquare } from 'lucide-react';
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
    isDeleted?: boolean;
    createdAt: string;
    parentId?: string | null;
    replies?: Message[];
    senderId?: string;
}

interface MessageCardProps {
    message: Message;
    viewerRole?: 'instructor' | 'student';
    onDelete?: () => Promise<void>;
    onEdit?: (newContent: string) => Promise<void>;
    isMine?: boolean;
    compact?: boolean;
    currentUserId?: string;
    onSendReply?: (content: string) => Promise<void>;
    onDeleteReply?: (replyId: string) => Promise<void>;
    onEditReply?: (replyId: string, content: string) => Promise<void>;
}

const MessageCard = ({ 
    message, 
    viewerRole, 
    onDelete, 
    onEdit, 
    isMine = false, 
    compact = false,
    currentUserId,
    onSendReply,
    onDeleteReply,
    onEditReply
}: MessageCardProps) => {
    const isInstructor = message.senderRole === 'instructor';
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(true);

    const isPdf = (url: string) => {
        return /\.pdf(\?.*)?$/i.test(url.split('?')[0]);
    };

    const handleViewPdf = (e: React.MouseEvent, url: string, title?: string) => {
        if (viewerRole === 'student' && isPdf(url)) {
            e.preventDefault();
            setViewingPdf({ url, title: title || 'Resource Archive' });
        }
    };

    useEffect(() => {
        if (isEditing && editorRef.current) {
            editorRef.current.innerHTML = message.content;
            // Set cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
            editorRef.current.focus();
        }
    }, [isEditing, message.content]);

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) {
            setEditContent(editorRef.current.innerHTML);
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
                    background-color: var(--index-hover-bg);
                }
                
                .message-avatar-sidebar {
                    width: 44px;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: center;
                    position: relative;
                }
                
                @media (max-width: 640px) {
                    .slack-message-row {
                        padding: ${compact ? '4px 12px' : '8px 12px'};
                    }
                    .message-avatar-sidebar {
                        width: 36px;
                    }
                    .avatar-img-circle {
                        width: 36px;
                        height: 36px;
                    }
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
                    background: ${isInstructor ? 'var(--index-primary-color)' : 'var(--lgl-charcoal)'};
                }

                .avatar-timestamp-on-hover {
                    position: absolute;
                    font-size: 0.65rem;
                    color: var(--index-text-faint);
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
                    flex-wrap: wrap;
                }

                .sender-displayName {
                    font-weight: 900;
                    color: var(--index-text-heading);
                    font-size: 0.95rem;
                }
                .instructor-badge-premium {
                    background: var(--index-accent-soft-bg);
                    color: var(--index-primary-color);
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 800;
                    text-transform: uppercase;
                    flex-shrink: 0;
                }

                .timestamp-minimal {
                    font-size: 0.75rem;
                    color: var(--index-text-secondary);
                    font-weight: 500;
                }

                .message-body-text {
                    font-size: 0.95rem;
                    color: var(--index-text-heading);
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
                    color: var(--index-primary-color);
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
                    border-left: 3px solid var(--index-border-color);
                    margin: 4px 0 8px 0;
                    padding-left: 12px;
                    color: var(--index-text-secondary);
                    font-style: italic;
                }
                .message-body-text code {
                    background: var(--index-hover-bg);
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    font-family: monospace;
                    color: var(--lgl-error);
                }
                .message-body-text pre {
                    background: var(--lgl-charcoal);
                    padding: 12px;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 8px 0;
                }
                .message-body-text pre code {
                    background: transparent;
                    color: var(--lgl-gray-light);
                    padding: 0;
                }
                
                .is-announcement .message-body-text {
                    padding: 8px 12px;
                    background: var(--index-danger-bg-soft);
                    border-left: 4px solid var(--lgl-error);
                    border-radius: 4px;
                    color: var(--lgl-error);
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
                    border: 1px solid var(--index-border-color);
                }

                .audio-attachment-pill {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--index-hover-bg);
                    border: 1px solid var(--index-border-color);
                    padding: 8px 16px;
                    border-radius: 30px;
                    max-width: fit-content;
                }
                
                .generic-file-attachment {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    border: 1px solid var(--index-border-color);
                    padding: 12px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: var(--index-text-heading);
                    max-width: 100%;
                    width: 100%;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .generic-file-attachment:hover {
                    background: var(--index-hover-bg);
                    border-color: var(--index-border-color);
                }

                .message-actions-hover {
                    position: absolute;
                    right: 24px;
                    top: -12px;
                    opacity: 0;
                    background: white;
                    border: 1px solid var(--index-border-color);
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
                    color: var(--index-text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:hover {
                    background: var(--index-hover-bg);
                    color: var(--index-text-heading);
                }
                .action-btn.delete:hover {
                    color: var(--lgl-error);
                    background: var(--index-danger-bg-soft);
                }
                
                .format-tool-btn {
                    padding: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    color: var(--index-text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .format-tool-btn:hover {
                    background: var(--index-hover-bg);
                    color: var(--index-text-heading);
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
                        {message.type === 'announcement' && <span className="instructor-badge-premium" style={{background:'var(--index-danger-bg-soft)', color:'var(--lgl-error)'}}>Announcement</span>}
                        <span className="timestamp-minimal">{message.createdAt}</span>
                    </div>
                )}

                {message.isDeleted ? (
                    <div className="message-body-text deleted" style={{ fontStyle: 'italic', color: 'var(--index-text-faint)' }}>
                        This message has been deleted.
                    </div>
                ) : isEditing ? (
                    <div style={{ width: '100%', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', borderBottom: '1px solid var(--index-hover-bg)', paddingBottom: '4px' }}>
                            <button onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="format-tool-btn" title="Bold">
                                <Bold size={18} />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="format-tool-btn" title="Italic">
                                <Italic size={18} />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="format-tool-btn" title="Underline">
                                <Underline size={18} />
                            </button>
                        </div>
                        <div 
                            ref={editorRef}
                            contentEditable
                            onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--index-border-color)',
                                fontSize: '0.95rem',
                                color: 'var(--index-text-heading)',
                                outline: 'none',
                                overflowY: 'auto',
                                background: 'white'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button 
                                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                                style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--index-border-color)', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
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
                                style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: 'var(--index-primary-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                disabled={isSaving || (editContent === message.content)}
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

                {message.attachmentUrl && !message.isDeleted && (message.type === 'message' || message.type === 'announcement') && (
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
                                <FileAudio size={20} color="var(--index-text-secondary)" />
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
                                <div style={{ background: 'var(--index-hover-bg)', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Download size={20} color="var(--index-primary-color)" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                                        {message.attachmentUrl.split('/').pop()?.split('?')[0] || 'Attachment'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--index-text-secondary)', fontWeight: 500 }}>
                                        {viewerRole === 'student' && isPdf(message.attachmentUrl) ? 'Secure PDF Document' : 'Click to download'}
                                    </span>
                                </div>
                            </a>
                        )}
                    </div>
                )}

                {isReplying && (
                    <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Reply to this message..."
                            style={{
                                flex: 1,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--index-border-color)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                background: 'white',
                                color: 'var(--index-text-heading)'
                            }}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && replyContent.trim()) {
                                    e.preventDefault();
                                    if (onSendReply) {
                                        await onSendReply(replyContent);
                                        setReplyContent('');
                                        setIsReplying(false);
                                        setShowReplies(true);
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={async () => {
                                if (replyContent.trim() && onSendReply) {
                                    await onSendReply(replyContent);
                                    setReplyContent('');
                                    setIsReplying(false);
                                    setShowReplies(true);
                                }
                            }}
                            style={{
                                padding: '6px 12px',
                                background: 'var(--index-primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                        <button
                            onClick={() => {
                                setIsReplying(false);
                                setReplyContent('');
                            }}
                            style={{
                                padding: '6px 12px',
                                background: 'var(--index-hover-bg)',
                                color: 'var(--index-text-secondary)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {message.replies && message.replies.length > 0 && !message.parentId && (
                    <button 
                        onClick={() => setShowReplies(!showReplies)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            background: 'var(--index-accent-soft-bg)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--index-primary-color)',
                            cursor: 'pointer'
                        }}
                    >
                        <MessageSquare size={14} />
                        {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--index-text-secondary)', marginLeft: '4px' }}>
                            {showReplies ? '(hide)' : '(view)'}
                        </span>
                    </button>
                )}

                {showReplies && message.replies && message.replies.length > 0 && !message.parentId && (
                    <div className="replies-list" style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '2px solid var(--index-border-color)', paddingLeft: '12px' }}>
                        {message.replies.map((reply) => {
                            const isReplyMine = !!(currentUserId && String(reply.senderId) === String(currentUserId));
                            return (
                                <MessageCard
                                    key={reply.id}
                                    message={reply}
                                    viewerRole={viewerRole}
                                    isMine={isReplyMine}
                                    compact={true}
                                    onDelete={onDeleteReply && (isReplyMine || viewerRole === 'instructor') ? () => onDeleteReply(reply.id) : undefined}
                                    onEdit={onEditReply && isReplyMine ? (newContent) => onEditReply(reply.id, newContent) : undefined}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            
            {!message.isDeleted && (
                <div className="message-actions-hover">
                    {onSendReply && !message.parentId && (
                        <button 
                            className="action-btn"
                            onClick={(e) => { e.stopPropagation(); setIsReplying(!isReplying); }}
                            title="Reply to Thread"
                        >
                            <CornerUpLeft size={16} />
                        </button>
                    )}
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
            )}

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
                    background: 'color-mix(in srgb, var(--lgl-charcoal) 90%, transparent)',
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
                            borderBottom: '1.5px solid var(--index-border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--index-hover-bg)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ padding: '10px', borderRadius: '14px', background: 'var(--index-accent-soft-bg)' }}>
                                    <FileText size={22} color="var(--index-primary-color)" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, color: 'var(--index-text-heading)', letterSpacing: '-0.02em' }}>{viewingPdf?.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>Secure PDF Viewer • Download Disabled</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewingPdf(null); }}
                                style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'var(--index-hover-bg)', border: 'none', color: 'var(--index-text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div
                            style={{ flex: 1, background: 'var(--index-hover-bg)', overflow: 'hidden', position: 'relative' }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <iframe
                                src={viewingPdf ? `${viewingPdf.url}#toolbar=0&navpanes=0` : ''}
                                style={{ width: '100%', height: '70vh', border: 'none' }}
                                title="Secure PDF Viewer"
                            />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'transparent' }}></div>
                        </div>

                        <div style={{ padding: '1rem 2.5rem', background: 'var(--index-hover-bg)', borderTop: '1.5px solid var(--index-border-subtle)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--index-text-faint)', fontWeight: 600 }}>Protected by Layos Group Security Protocol</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageCard;
