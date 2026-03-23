import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Clock,
    Video,
    AlertCircle,
    Link as LinkIcon,
    ArrowLeft,
    MonitorIcon,
    CalendarDays,
    FileVideo
} from 'lucide-react';

interface Course {
    id: number;
    title: string;
}

export default function CreateLiveSession() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
    });
    const [recordingUrl, setRecordingUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`${API_URL}/courses`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setCourses(data);
                }
            } catch (err) {
                console.error("Fetch Courses Error:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [API_URL]);

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

        // Meeting link is now optional
        if (formData.meetingLink && !/^https?:\/\/.+/.test(formData.meetingLink)) {
            errors.meetingLink = 'Must be a valid URL (starting with http/https)';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const submitData = new FormData();
                submitData.append('title', formData.title);
                submitData.append('course_id', formData.courseId);
                submitData.append('scheduled_date', formData.date);
                submitData.append('start_time', formData.startTime);
                submitData.append('end_time', formData.endTime);
                submitData.append('meeting_link', formData.meetingLink);
                if (recordingUrl) {
                    submitData.append('recording_link', recordingUrl);
                }

                const response = await fetch(`${API_URL}/live-sessions`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: submitData
                });

                if (response.ok) {
                    navigate('/instructor/live', { state: { success: true } });
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Failed to create live session');
                }
            } catch (err) {
                console.error("Create Live Session Error:", err);
                alert('An error occurred. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleFileUpload = async (file: File) => {
        const token = localStorage.getItem('token');
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('video', file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload-video`, true);
            xhr.setRequestHeader('Accept', 'application/json');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setUploadProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            const response: any = await new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch { reject(new Error('Invalid response')); }
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });

            if (response.success) {
                setRecordingUrl(response.video_url);
            } else {
                alert(response.message || 'Upload failed');
            }
        } catch (err: any) {
            alert(err.message || 'An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = async () => {
        if (!window.confirm('Delete this recording permanently?')) return;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/delete-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ video_url: recordingUrl })
            });

            if (response.ok) {
                setRecordingUrl('');
            } else {
                alert('Failed to delete video');
            }
        } catch (err) {
            alert('An error occurred during deletion');
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

                @media (max-width: 768px) {
                    .create-live-card {
                        padding: 1.5rem;
                        border-radius: 20px;
                    }
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

                <style>{`
                    @media (max-width: 640px) {
                        .dashboard-header-title {
                            font-size: 1.25rem !important;
                        }
                        .dashboard-header-title + p {
                            font-size: 0.85rem !important;
                        }
                    }
                `}</style>
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
                            disabled={loadingCourses}
                        >
                            <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
                            {courses.map(c => (
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
                            <LinkIcon size={16} /> Meeting Link (Microsoft Teams)
                        </label>
                        <input
                            type="text"
                            className={`form-input-modern ${formErrors.meetingLink ? 'error' : ''}`}
                            placeholder="https://teams.microsoft.com/l/meetup-join/..."
                            value={formData.meetingLink}
                            onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                        />
                        {formErrors.meetingLink && <p className="error-text"><AlertCircle size={14} /> {formErrors.meetingLink}</p>}
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>Optional. Visible to students when the session is live.</p>
                    </div>

                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            <FileVideo size={16} /> Pre-recorded Session (Optional)
                        </label>
                        {uploading ? (
                            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '14px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Uploading... {uploadProgress}%</div>
                                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }}></div>
                                </div>
                            </div>
                        ) : recordingUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: '14px', border: '1px solid #bcf0da' }}>
                                <FileVideo size={20} color="#10b981" />
                                <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: '#1a4d3e', wordBreak: 'break-all' }}>{recordingUrl}</div>
                                <button type="button" onClick={handleDeleteVideo} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Remove</button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="form-input-modern"
                                    onChange={e => {
                                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                        e.target.value = '';
                                    }}
                                    style={{ padding: '0.6rem' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>Upload a video file for students to watch later.</p>
                            </>
                        )}
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
