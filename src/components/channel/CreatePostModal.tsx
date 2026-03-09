import { useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: any) => void;
}

const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
    const [type, setType] = useState<'message' | 'announcement' | 'assignment'>('message');
    const [content, setContent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            type,
            content,
            dueDate: type === 'assignment' ? dueDate : undefined,
            attachment,
            createdAt: 'Just now'
        });
        setContent('');
        setDueDate('');
        setAttachment(null);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Post</h2>
                    <button className="close-modal-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group-modern">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Post Type</label>
                        <select
                            value={type}
                            onChange={(e: any) => setType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '0.95rem',
                                color: '#1e293b'
                            }}
                        >
                            <option value="message">Standard Message</option>
                            <option value="announcement">Announcement</option>
                            <option value="assignment">Assignment</option>
                        </select>
                    </div>

                    <div className="form-group-modern">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Content</label>
                        <textarea
                            rows={4}
                            required
                            placeholder="Type your message here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                color: '#334155',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {type === 'assignment' && (
                        <div className="form-group-modern">
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => document.getElementById('modal-file-attachment')?.click()}
                            style={{
                                background: attachment ? '#f0fdf4' : '#f1f5f9',
                                border: 'none',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: attachment ? '#16a34a' : '#64748b',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                            }}
                        >
                            <Paperclip size={18} />
                            {attachment ? attachment.name.substring(0, 15) + '...' : 'Attach File'}
                            <input
                                type="file"
                                id="modal-file-attachment"
                                style={{ display: 'none' }}
                                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                            />
                        </button>

                        <button
                            type="submit"
                            className="btn-save-settings"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.25)',
                                background: '#3b82f6'
                            }}
                        >
                            <Send size={18} />
                            Post to Channel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
