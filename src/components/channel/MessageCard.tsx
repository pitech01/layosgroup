import { useState } from 'react';
import { Calendar, Download, FileAudio, Eye, X, FileText } from 'lucide-react';

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
}

const MessageCard = ({ message, viewerRole }: MessageCardProps) => {
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
        <div className={`channel-message-card ${message.type}`}>
            <div className="message-header">
                <div className="sender-info">
                    <div className="sender-avatar">
                        {message.senderName.charAt(0)}
                    </div>
                    <div className="sender-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="sender-name">{message.senderName}</span>
                            <span className={`message-role-badge ${isInstructor ? 'role-instructor' : 'role-student'}`}>
                                {message.senderRole}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                            {message.createdAt}
                        </span>
                    </div>
                </div>

                {message.type !== 'message' && (
                    <span className={`message-type-badge type-${message.type}`}>
                        {message.type}
                    </span>
                )}
            </div>

            <div className="message-content">
                <p style={{ margin: 0 }}>{message.content}</p>

                {message.attachmentUrl && (message.type === 'message' || message.type === 'announcement') && (
                    <div style={{ marginTop: '0.75rem' }}>
                        {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div style={{ maxWidth: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                <img src={message.attachmentUrl} alt="Attachment" style={{ width: '100%', display: 'block' }} loading="lazy" />
                            </div>
                        ) : /\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '32px', display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                    <FileAudio size={20} />
                                </div>
                                <audio controls src={message.attachmentUrl} style={{ height: '40px', outline: 'none' }} />
                            </div>
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="attachment-link"
                                style={{ display: 'inline-flex', marginTop: '0.5rem' }}
                                onClick={(e) => handleViewPdf(e, message.attachmentUrl!, 'Attachment')}
                            >
                                {viewerRole === 'student' && isPdf(message.attachmentUrl) ? (
                                    <><Eye size={14} /> View Attachment</>
                                ) : (
                                    <><Download size={14} /> Download Attachment</>
                                )}
                            </a>
                        )}
                    </div>
                )}

                {message.type === 'assignment' && (
                    <div className="assignment-details">
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} /> Assignment Details
                        </div>
                        <div className="assignment-meta-row">
                            {message.dueDate && (
                                <div style={{ fontSize: '0.85rem', color: '#444' }}>
                                    <span style={{ fontWeight: 700 }}>Due:</span> {message.dueDate}
                                </div>
                            )}
                            {message.attachmentUrl && (
                                <a
                                    href={message.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="attachment-link"
                                    onClick={(e) => handleViewPdf(e, message.attachmentUrl!, 'Course Material')}
                                >
                                    {viewerRole === 'student' && isPdf(message.attachmentUrl) ? (
                                        <><Eye size={14} /> View Material</>
                                    ) : (
                                        <><Download size={14} /> Download Material</>
                                    )}
                                </a>
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
