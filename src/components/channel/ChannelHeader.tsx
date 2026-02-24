import { Plus, Hash } from 'lucide-react';

interface ChannelHeaderProps {
    courseTitle: string;
    onNewPost?: () => void;
    showPostButton?: boolean;
}

const ChannelHeader = ({ courseTitle, onNewPost, showPostButton = false }: ChannelHeaderProps) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Hash size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{courseTitle}</h1>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Course Channel</span>
                </div>
            </div>

            {showPostButton && onNewPost && (
                <button
                    onClick={onNewPost}
                    className="btn-save-settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        boxShadow: 'none'
                    }}
                >
                    <Plus size={18} />
                    New Post
                </button>
            )}
        </div>
    );
};

export default ChannelHeader;
