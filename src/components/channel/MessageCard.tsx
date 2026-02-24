import { Calendar, Download } from 'lucide-react';

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
                                <a href="#" className="attachment-link">
                                    <Download size={14} /> Material.pdf
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {message.type === 'announcement' && message.attachmentUrl && (
                    <div style={{ marginTop: '1rem' }}>
                        <a href="#" className="attachment-link" style={{ background: '#e0f2fe' }}>
                            <Download size={14} /> Announcement_File.pdf
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageCard;
