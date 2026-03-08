import { Plus, Hash } from 'lucide-react';

interface ChannelHeaderProps {
    courseTitle: string;
    onNewPost?: () => void;
    showPostButton?: boolean;
}

const ChannelHeader = ({ courseTitle, onNewPost, showPostButton = false }: ChannelHeaderProps) => {
    return (
        <div className="channel-header-top" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9'
        }}>
            <style>{`
                @media (max-width: 640px) {
                    .channel-header-top {
                        padding-bottom: 1rem !important;
                        margin-bottom: 1rem !important;
                    }
                    .ch-title-box h1 {
                        font-size: 1.15rem !important;
                    }
                    .ch-icon-box {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .ch-icon-box svg {
                        width: 18px !important;
                        height: 18px !important;
                    }
                    .ch-new-post-btn {
                        padding: 0.5rem 1rem !important;
                        font-size: 0.8rem !important;
                    }
                }
            `}</style>
            <div className="ch-title-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="ch-icon-box" style={{
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
                    className="btn-save-settings ch-new-post-btn"
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
