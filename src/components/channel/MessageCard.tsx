import { useState } from 'react';
import { Calendar, Download, FileAudio, Eye, X, FileText, Trash2 } from 'lucide-react';

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
}

const MessageCard = ({ message, viewerRole, onDelete }: MessageCardProps) => {
    const isInstructor = message.senderRole === 'instructor';
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

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
        <div className={`channel-message-wrapper ${message.type}`}>
            <div className="message-avatar-sidebar">
                <div className={`avatar-circle ${isInstructor ? 'instructor' : 'student'}`}>
                    {message.senderName.charAt(0)}
                </div>
            </div>
            
            <div className="message-main-content">
                <div className="message-upper-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="sender-displayName">{message.senderName}</span>
                        {isInstructor && <span className="instructor-badge-premium">Instructor</span>}
                        <span className="timestamp-minimal">{message.createdAt}</span>
                    </div>
                    {message.type !== 'message' && (
                        <div className={`type-indicator-tag ${message.type}`}>
                            {message.type.toUpperCase()}
                        </div>
                    )}
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.6, transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                            title="Delete Message"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                <div className="message-text-body">
                    {message.content}
                </div>

                {message.attachmentUrl && (message.type === 'message' || message.type === 'announcement') && (
                    <div className="message-attachment-container">
                        {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="image-attachment-preview">
                                <img src={message.attachmentUrl} alt="Attachment" loading="lazy" />
                                <div className="img-overlay-actions">
                                    <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="action-pill"><Eye size={14}/> Full Preview</a>
                                </div>
                            </div>
                        ) : /\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="audio-attachment-pill">
                                <div className="audio-icon-box"><FileAudio size={20} /></div>
                                <audio controls src={message.attachmentUrl} />
                            </div>
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="generic-file-attachment"
                                onClick={(e) => handleViewPdf(e, message.attachmentUrl!, 'Attachment')}
                            >
                                <div className="file-icon-square"><Download size={18} /></div>
                                <div className="file-info-text">
                                    <span className="file-name-label">{message.attachmentUrl.split('/').pop()?.split('?')[0] || 'Download Attachment'}</span>
                                    <span className="file-action-hint">{viewerRole === 'student' && isPdf(message.attachmentUrl) ? 'Click to view secure PDF' : 'Click to download file'}</span>
                                </div>
                            </a>
                        )}
                    </div>
                )}

                {message.type === 'assignment' && (
                    <div className="luxury-assignment-card">
                        <div className="assignment-card-header">
                            <Calendar size={18} />
                            <span>Academic Assignment Detail</span>
                        </div>
                        <div className="assignment-card-body">
                            {message.dueDate && (
                                <div className="due-date-row">
                                    <span className="label">SUBMISSION DEADLINE</span>
                                    <span className="value">{message.dueDate}</span>
                                </div>
                            )}
                            {message.attachmentUrl && (
                                <button
                                    className="assignment-action-btn"
                                    onClick={(e: any) => handleViewPdf(e, message.attachmentUrl!, 'Course Material')}
                                >
                                    {viewerRole === 'student' && isPdf(message.attachmentUrl) ? (
                                        <><Eye size={16} /> Open Resource Module</>
                                    ) : (
                                        <><Download size={16} /> Download Material Asset</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
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
                                onClick={() => setViewingPdf(null)}
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
