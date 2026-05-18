import { Link } from 'react-router-dom';
import { Hash, MessageSquare, Clock } from 'lucide-react';

interface ChannelCardProps {
    courseId: string | number;
    courseTitle: string;
    instructorName?: string;
    postCount?: number;
    lastActivity: string;
    basePath: string; // '/instructor' or '/student'
}

const ChannelCard = ({ courseId, courseTitle, instructorName, postCount, lastActivity, basePath }: ChannelCardProps) => {
    return (
        <div className="channel-card-modern">
            <div className="channel-card-icon">
                <Hash size={24} />
            </div>

            <h3 className="channel-card-title">{courseTitle}</h3>

            <div className="channel-card-meta">
                {instructorName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{instructorName}</span>
                    </div>
                )}
                {postCount !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={14} />
                        <span>{postCount} posts total</span>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} />
                    <span>Last active: {lastActivity}</span>
                </div>
            </div>

            <Link
                to={`${basePath}/courses/${courseId}/channel`}
                className="btn-save-settings"
                style={{
                    marginTop: 'auto',
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    boxShadow: 'none'
                }}
            >
                Open Channel
            </Link>
        </div>
    );
};

export default ChannelCard;
