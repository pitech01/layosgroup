import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Clock,
    Video,
    AlertCircle,
    Link as LinkIcon,
    ArrowLeft,
    MonitorIcon,
    CalendarDays
} from 'lucide-react';

interface Course {
    id: string;
    title: string;
    status: string;
}

const MOCK_COURSES: Course[] = [
    { id: 'c1', title: 'Professional React Development', status: 'ongoing' },
    { id: 'c2', title: 'Fullstack Web Mastery', status: 'ongoing' },
    { id: 'c3', title: 'UI/UX Design Masterclass', status: 'ongoing' },
    { id: 'c4', title: 'Backend Engineering', status: 'ongoing' },
    { id: 'c5', title: 'Legacy jQuery Course', status: 'completed' },
];

export default function CreateLiveSession() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(formData.date);

        if (!formData.title) errors.title = 'Session title is required';
        if (!formData.courseId) errors.courseId = 'Please select a course';
        if (!formData.date) {
            errors.date = 'Date is required';
        } else if (selectedDate < today) {
            errors.date = 'Date cannot be in the past';
        }
        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.endTime) errors.endTime = 'End time is required';
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            errors.endTime = 'End time must be after start time';
        }

        // Meeting link is now mandatory
        if (!formData.meetingLink) {
            errors.meetingLink = 'Meeting link is required';
        } else if (!/^https?:\/\/.+/.test(formData.meetingLink)) {
            errors.meetingLink = 'Must be a valid URL (starting with http/https)';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);

            // Simulate API call
            setTimeout(() => {
                setIsSubmitting(false);
                navigate('/instructor/live', { state: { success: true } });
            }, 1000);
        }
    };

    return (
        <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <style>{`
                .create-live-card {
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .form-group-modern {
                    margin-bottom: 2rem;
                }

                .form-label-modern {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .form-input-modern {
                    width: 100%;
                    padding: 0.85rem 1.15rem;
                    border: 2px solid #f1f5f9;
                    border-radius: 14px;
                    background: #f8fafc;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 0.95rem;
                }

                .form-input-modern:focus {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .form-input-modern.error {
                    border-color: #ef4444;
                    background: #fffafa;
                }

                .error-text {
                    color: #ef4444;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .btn-submit-live {
                    background: #020617;
                    color: white;
                    width: 100%;
                    padding: 1.15rem;
                    border-radius: 16px;
                    border: none;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    margin-top: 1rem;
                    box-shadow: 0 10px 20px rgba(2, 6, 23, 0.2);
                }

                .btn-submit-live:hover:not(:disabled) {
                    background: #0f172a;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(2, 6, 23, 0.3);
                }

                .btn-submit-live:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .back-btn {
                    background: #f1f5f9;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 14px;
                    cursor: pointer;
                    color: #020617;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .back-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }

                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .create-live-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>

            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/instructor/live')}
                    className="back-btn"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="dashboard-header-title" style={{ margin: 0, fontSize: '1.75rem' }}>Schedule Live Session</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Create a new interactive session for your students.</p>
                </div>
            </div>

            <div className="create-live-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            <MonitorIcon size={16} /> Session Title
                        </label>
                        <input
                            type="text"
                            className={`form-input-modern ${formErrors.title ? 'error' : ''}`}
                            placeholder="e.g. Advanced System Design Q&A"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        {formErrors.title && <p className="error-text"><AlertCircle size={14} /> {formErrors.title}</p>}
                    </div>

                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            <Video size={16} /> Associate Course
                        </label>
                        <select
                            className={`form-input-modern ${formErrors.courseId ? 'error' : ''}`}
                            value={formData.courseId}
                            onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                        >
                            <option value="">Select an ongoing course</option>
                            {MOCK_COURSES.filter(c => c.status === 'ongoing').map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        {formErrors.courseId && <p className="error-text"><AlertCircle size={14} /> {formErrors.courseId}</p>}
                    </div>

                    <div className="form-grid">
                        <div className="form-group-modern">
                            <label className="form-label-modern">
                                <CalendarDays size={16} /> Select Date
                            </label>
                            <input
                                type="date"
                                className={`form-input-modern ${formErrors.date ? 'error' : ''}`}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                            {formErrors.date && <p className="error-text"><AlertCircle size={14} /> {formErrors.date}</p>}
                        </div>

                        <div className="form-grid">
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <Clock size={16} /> Start Time
                                </label>
                                <input
                                    type="time"
                                    className={`form-input-modern ${formErrors.startTime ? 'error' : ''}`}
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                                {formErrors.startTime && <p className="error-text"><AlertCircle size={14} /> {formErrors.startTime}</p>}
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    <Clock size={16} /> End Time
                                </label>
                                <input
                                    type="time"
                                    className={`form-input-modern ${formErrors.endTime ? 'error' : ''}`}
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                                {formErrors.endTime && <p className="error-text"><AlertCircle size={14} /> {formErrors.endTime}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            <LinkIcon size={16} /> Meeting Link (Zoom, Meet, etc.)
                        </label>
                        <input
                            type="text"
                            className={`form-input-modern ${formErrors.meetingLink ? 'error' : ''}`}
                            placeholder="https://zoom.us/j/..."
                            value={formData.meetingLink}
                            onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                        />
                        {formErrors.meetingLink && <p className="error-text"><AlertCircle size={14} /> {formErrors.meetingLink}</p>}
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>This link will be visible to students when the session is live.</p>
                    </div>

                    <button type="submit" className="btn-submit-live" disabled={isSubmitting}>
                        {isSubmitting ? 'Scheduling...' : 'Create Live Session'}
                        {!isSubmitting && <Plus size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
