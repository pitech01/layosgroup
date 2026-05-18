import MessageCard from './MessageCard';
import type { Message } from './MessageCard';
import { MessageSquareOff } from 'lucide-react';

interface ChannelFeedProps {
    messages: Message[];
    userRole: 'instructor' | 'student';
}

const ChannelFeed = ({ messages, userRole }: ChannelFeedProps) => {
    if (messages.length === 0) {
        return (
            <div className="empty-channel-state">
                <div className="empty-icon-box">
                    <MessageSquareOff size={40} />
                </div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No posts yet</h3>
                <p style={{ color: '#64748b', margin: 0 }}>
                    {userRole === 'instructor'
                        ? 'Post your first announcement or message to the class.'
                        : 'Nothing has been shared yet.'}
                </p>
            </div>
        );
    }

    return (
        <div className="channel-feed-container">
            {messages.map((msg) => (
                <MessageCard key={msg.id} message={msg} viewerRole={userRole} />
            ))}
        </div>
    );
};

export default ChannelFeed;
