import { Calendar, Download, FileAudio } from 'lucide-react';

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
}

const MessageCard = ({ message }: MessageCardProps) => {
    const isInstructor = message.senderRole === 'instructor';

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
                            <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="attachment-link" style={{ display: 'inline-flex', marginTop: '0.5rem' }}>
                                <Download size={14} /> Download Attachment
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
                                <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="attachment-link">
                                    <Download size={14} /> Download Material
                                </a>
                            )}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default MessageCard;
