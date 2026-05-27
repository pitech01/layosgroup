import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Activity,
    MapPin,
    Loader2,
    AlertCircle,
    CheckCircle2,
    X,
    HelpCircle,
    Eye,
    Check,
    Plus,
    Layers,
    Info
} from 'lucide-react';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateMessage, setDeactivateMessage] = useState('');
    const [pendingCohortId, setPendingCohortId] = useState<string | null>(null);
    const [viewingQuizResult, setViewingQuizResult] = useState<any>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Zelle receipt preview & approval states
    const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Cohort Assignment states
    const [showAssignCohortModal, setShowAssignCohortModal] = useState(false);
    const [allCohorts, setAllCohorts] = useState<any[]>([]);
    const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
    const [loadingCohorts, setLoadingCohorts] = useState(false);
    const [assigningCohorts, setAssigningCohorts] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleApprovePayment = async () => {
        setShowApproveModal(false);
        setApproving(true);
        try {
            const response = await fetch(`${API_URL}/instructor/students/${id}/approve-payment`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: data.message || 'Payment approved and welcome email sent!' });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to approve payment.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setApproving(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleRejectPayment = async () => {
        setShowRejectModal(false);
        setRejecting(true);
        try {
            const response = await fetch(`${API_URL}/instructor/students/${id}/reject-payment`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: data.message || 'Payment status updated to rejected.' });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to reject payment.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setRejecting(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const fetchCohorts = async () => {
        setLoadingCohorts(true);
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAllCohorts(data);
            } else {
                throw new Error(data.message || 'Failed to load cohorts.');
            }
        } catch (err: any) {
            console.error('Error fetching cohorts:', err);
            setNotification({ type: 'error', message: err.message || 'Error loading available cohorts.' });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setLoadingCohorts(false);
        }
    };

    const handleAssignCohorts = async () => {
        if (selectedCohortIds.length === 0) return;
        setAssigningCohorts(true);
        try {
            const response = await fetch(`${API_URL}/instructor/students/${id}/assign-cohorts`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ cohorts: selectedCohortIds })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: data.message || 'Cohorts assigned successfully!' });
                fetchStudentData();
                setShowAssignCohortModal(false);
                setSelectedCohortIds([]);
            } else {
                throw new Error(data.message || 'Failed to assign cohorts.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setAssigningCohorts(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setStudent(data);
            } else {
                throw new Error(data.message || 'Failed to retrieve student profile.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleActivation = async (cohortId: string, currentStatus: string, message?: string) => {
        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';

        // If deactivating and no message yet, show modal
        if (newStatus === 'inactive' && !message) {
            setPendingCohortId(cohortId);
            setShowDeactivateModal(true);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cohorts/${cohortId}/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    message: message
                })
            });

            if (response.ok) {
                setShowDeactivateModal(false);
                setDeactivateMessage('');
                setPendingCohortId(null);
                setNotification({ type: 'success', message: `Student status updated to ${newStatus}.` });
                fetchStudentData();
                setTimeout(() => setNotification(null), 4000);
            } else {
                const data = await response.json();
                setNotification({ type: 'error', message: data.message || 'Failed to update access status.' });
                setTimeout(() => setNotification(null), 4000);
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            setNotification({ type: 'error', message: 'An error occurred while updating access.' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const confirmDeactivation = () => {
        if (pendingCohortId) {
            toggleActivation(pendingCohortId, 'active', deactivateMessage);
        }
    };

    const [expandedCohortMap, setExpandedCohortMap] = useState<Record<string, boolean>>({});

    const toggleLessonCompletion = async (lessonId: string, currentCompleted: boolean) => {
        try {
            const response = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    student_id: student.id,
                    completed: !currentCompleted
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: 'Lesson progress updated successfully.' });
                fetchStudentData(); 
            } else {
                setNotification({ type: 'error', message: data.message || 'Failed to update lesson progress.' });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Network error updating progress.' });
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    // Derived Metrics
    const validCohorts = student?.cohorts || [];
    const avgCompletion = validCohorts.length > 0
        ? Math.round(validCohorts.reduce((acc: number, c: any) => acc + Number(c.pivot?.progress || 0), 0) / validCohorts.length)
        : 0;

    const scoredLessons = student?.completed_lessons?.filter((l: any) => l.pivot?.score != null) || [];
    const avgQuizScore = scoredLessons.length > 0 
        ? Math.round(scoredLessons.reduce((acc: number, l: any) => acc + Number(l.pivot?.score), 0) / scoredLessons.length) 
        : 'N/A';

    return (
        <div className="student-details-container">
            <style>{`
                .receipt-thumbnail-hover:hover .receipt-overlay {
                    opacity: 1 !important;
                }
                .receipt-thumbnail-hover:hover img {
                    transform: scale(1.05);
                }
                .receipt-thumbnail-hover img {
                    transition: transform 0.3s ease;
                }
                .approve-btn-premium:hover {
                    transform: translateY(-2px);
                    background: #059669 !important;
                    box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3) !important;
                }
                .approve-btn-premium:active {
                    transform: translateY(0);
                }
                .reject-btn-premium:hover {
                    background: #fef2f2 !important;
                    border-color: #fca5a5 !important;
                }

                .staff-scope .student-details-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .staff-scope .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    transition: all 0.3s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .back-link:hover {
                    color: #0f172a;
                    transform: translateX(-4px);
                }

                .staff-scope .profile-header-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    display: flex;
                    gap: 3rem;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .avatar-massive {
                    width: 140px;
                    height: 140px;
                    background: linear-gradient(135deg, #1a4d3e, #2d5a4c);
                    border-radius: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3.5rem;
                    font-weight: 950;
                    box-shadow: 0 20px 40px -10px rgba(26, 77, 62, 0.3);
                }

                .profile-info h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                }

                .staff-scope .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 950;
                    margin-bottom: 1.5rem;
                }

                .staff-scope .contact-grid-mini {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .staff-scope .contact-item-mini {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .staff-scope .details-layout {
                    display: grid;
                    grid-template-columns: 1fr 0.4fr;
                    gap: 2.5rem;
                }

                .staff-scope .card-premium-records {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                }

                .staff-scope .card-title-records {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .card-title-records h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 950;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .staff-scope .enrollment-row {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 20px;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }

                .enrollment-row:hover {
                    border-color: #1a4d3e;
                    background: white;
                    transform: translateY(-2px);
                }

                .staff-scope .progress-ring-mini {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    background: #f0fdf4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a4d3e;
                    font-weight: 950;
                    font-size: 0.9rem;
                }

                .staff-scope .activity-item {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 1.5rem;
                    border-left: 2px solid #f1f5f9;
                    margin-left: 10px;
                    padding-left: 20px;
                    position: relative;
                }

                .activity-item::before {
                    content: '';
                    position: absolute;
                    left: -7px;
                    top: 0;
                    width: 12px;
                    height: 12px;
                    background: white;
                    border: 2px solid #1a4d3e;
                    border-radius: 50%;
                }

                .activity-content div {
                    font-weight: 850;
                    color: #0f172a;
                    font-size: 0.95rem;
                }

                .activity-content span {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .staff-scope .btn-secondary-outline {
                    background: transparent;
                    color: #475569;
                    border: 1.5px solid #f1f5f9;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-secondary-outline:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .staff-scope .btn-toggle-active {
                    background: #f0fdf4;
                    color: #1a4d3e;
                    border: 1.5px solid #dcfce7;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-toggle-active:hover {
                    background: #dcfce7;
                }

                .staff-scope .btn-toggle-inactive {
                    background: #fef2f2;
                    color: #b91c1c;
                    border: 1.5px solid #fee2e2;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-toggle-inactive:hover {
                    background: #fee2e2;
                }

                .staff-scope .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .staff-scope .modal-box {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 28px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }

                .modal-box h3 {
                    margin: 0 0 1rem 0;
                    font-weight: 950;
                    color: #0f172a;
                    font-size: 1.5rem;
                }

                .modal-box textarea {
                    width: 100%;
                    height: 120px;
                    padding: 1rem;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                    font-family: inherit;
                    resize: none;
                }

                .modal-box textarea:focus {
                    outline: none;
                    border-color: #1a4d3e;
                }

                .staff-scope .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .staff-scope .btn-confirm {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .staff-scope .btn-cancel {
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                }

                @media (max-width: 1024px) {
                    .staff-scope .profile-header-premium {
                        padding: 2rem;
                        gap: 2rem;
                    }
                    .staff-scope .avatar-massive {
                        width: 100px;
                        height: 100px;
                        font-size: 2.5rem;
                        border-radius: 32px;
                    }
                    .profile-info h1 {
                        font-size: 2rem;
                    }
                    .staff-scope .details-layout {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .staff-scope .profile-header-premium {
                        flex-direction: column;
                        text-align: center;
                        padding: 2.5rem 1.5rem;
                    }
                    .staff-scope .contact-grid-mini {
                        justify-content: center;
                    }
                    .staff-scope .enrollment-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .enrollment-row > div:last-child {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .enrollment-row button {
                        width: 100%;
                        justify-content: center;
                        height: 48px;
                    }
                    .staff-scope .card-premium-records {
                        padding: 1.5rem;
                    }
                    .staff-scope .metrics-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .staff-scope .stat-box-mini {
                        min-width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .profile-info h1 {
                        font-size: 1.5rem;
                    }
                    .staff-scope .contact-grid-mini {
                        gap: 1rem;
                    }
                    .staff-scope .avatar-massive {
                        width: 80px;
                        height: 80px;
                        font-size: 2rem;
                    }
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={18} /> Back to Students
            </button>

            {notification && (
                <div className="animate-slide-in" style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 1000,
                    padding: '1rem 1.5rem',
                    background: notification.type === 'success' ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#ffe4e6'}`,
                    color: notification.type === 'success' ? '#166534' : '#e11d48',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    fontWeight: 700
                }}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <X size={16} color={notification.type === 'success' ? '#166534' : '#e11d48'} />
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '8rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Loading Profile...</p>
                </div>
            ) : error || !student ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '32px', border: '1.5px solid #ffe4e6', textAlign: 'center' }}>
                    <AlertCircle size={40} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 950 }}>Student Not Found</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 2rem' }}>{error || 'Unable to load student details.'}</p>
                    <button onClick={fetchStudentData} className="back-link" style={{ margin: '0 auto' }}>Try Again</button>
                </div>
            ) : (
                <>
                    <div className="profile-header-premium shadow-premium">
                        <div className="avatar-massive">
                            {student.name.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <div className="status-pill">
                                <ShieldCheck size={16} /> Verified Student
                            </div>
                            <h1>{student.name}</h1>
                            <div className="contact-grid-mini">
                                <div className="contact-item-mini"><Mail size={18} /> {student.email}</div>
                                {student.phone && <div className="contact-item-mini"><Phone size={18} /> {student.phone}</div>}
                                <div className="contact-item-mini"><Calendar size={18} /> Member since {new Date(student.created_at).toLocaleDateString()}</div>
                                <div className="contact-item-mini"><MapPin size={18} /> Student Access</div>
                            </div>
                        </div>
                    </div>

                    <div className="details-layout">
                        <div className="main-records">
                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><BookOpen size={20} color="#1a4d3e" /> Academic Enrollments</h3>
                                    {student?.payment_status !== 'rejected' && (
                                        <button 
                                            className="btn-secondary-outline" 
                                            onClick={() => {
                                                setShowAssignCohortModal(true);
                                                fetchCohorts();
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#10b981', color: '#1a4d3e', background: '#f0fdf4' }}
                                        >
                                            <Plus size={16} /> Assign Cohort
                                        </button>
                                    )}
                                </div>

                                {student.cohorts && student.cohorts.length > 0 ? student.cohorts.map((cohort: any) => (
                                    <div key={cohort.id} style={{ marginBottom: '1rem' }}>
                                        <div className="enrollment-row" style={{ marginBottom: 0, borderRadius: expandedCohortMap[cohort.id] ? '20px 20px 0 0' : '20px' }}>
                                            <div className="progress-ring-mini">{Math.round(cohort.pivot?.progress || 0)}%</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1.1rem' }}>{cohort.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                                    {cohort.course?.title || 'General Curriculum'} • Joined {new Date(cohort.pivot?.created_at).toLocaleDateString()}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 850,
                                                        color: cohort.pivot?.status === 'inactive' ? '#ef4444' : '#10b981',
                                                        background: cohort.pivot?.status === 'inactive' ? '#fef2f2' : '#f0fdf4',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {cohort.pivot?.status?.toUpperCase() || 'ENROLLED'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button className="btn-secondary-outline" onClick={() => setExpandedCohortMap(p => ({ ...p, [cohort.id]: !p[cohort.id] }))}>
                                                    {expandedCohortMap[cohort.id] ? 'Hide Progress' : 'Manage Progress'}
                                                </button>
                                                <button
                                                    className={cohort.pivot?.status === 'inactive' ? "btn-toggle-active" : "btn-toggle-inactive"}
                                                    onClick={() => toggleActivation(cohort.id, cohort.pivot?.status)}
                                                >
                                                    {cohort.pivot?.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                                </button>
                                            </div>
                                        </div>
                                        {expandedCohortMap[cohort.id] && (
                                            <div className="animate-fade-in-up" style={{ padding: '2.5rem', background: '#fcfdfe', border: '1.5px solid #f1f5f9', borderTop: 'none', borderRadius: '0 0 20px 20px', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.02)' }}>
                                                <h4 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CheckCircle2 size={18} color="#1a4d3e" /> Curriculum Override Access
                                                </h4>
                                                <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Toggle the checkboxes below to manually apply or revoke completion status for a specific resource. This persists immediately to the backend and adjusts percentages automatically.</p>
                                                
                                                {cohort.course?.modules?.map((mod: any) => (
                                                    <div key={mod.id} style={{ marginBottom: '1.5rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 800, color: '#1a4d3e', padding: '1rem 1.5rem', background: '#f8fafc', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0' }}>{mod.title}</div>
                                                        <div style={{ display: 'grid', padding: '1rem' }}>
                                                            {mod.lessons?.map((lesson: any) => {
                                                                const isCompleted = student?.completed_lessons?.some((cl: any) => cl.id === lesson.id);
                                                                return (
                                                                    <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                            <button 
                                                                                onClick={() => toggleLessonCompletion(lesson.id, !!isCompleted)}
                                                                                style={{ width: '26px', height: '26px', borderRadius: '8px', border: `2px solid ${isCompleted ? '#10b981' : '#cbd5e1'}`, background: isCompleted ? '#10b981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }}
                                                                            >
                                                                                {isCompleted && <CheckCircle2 size={16} color="white" />}
                                                                            </button>
                                                                            <span style={{ fontWeight: 700, color: isCompleted ? '#94a3b8' : '#334155', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none', transition: 'all 0.2s' }}>{lesson.title}</span>
                                                                        </div>
                                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{lesson.type}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(!mod.lessons || mod.lessons.length === 0) && (
                                                                <p style={{ margin: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 600 }}>No lessons active in module...</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!cohort.course?.modules || cohort.course.modules.length === 0) && (
                                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>No curriculum data bound to this record.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                        <BookOpen size={32} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748b', fontWeight: 600 }}>No course enrollments found for this student.</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><Award size={20} color="#1a4d3e" /> Learning Metrics</h3>
                                </div>
                                <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <TrendingUp size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Avg. Completion</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>
                                            {avgCompletion}%
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <Clock size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Total Cohorts</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>{student.cohorts?.length || 0}</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <Activity size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Avg. Quiz Score</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>
                                            {avgQuizScore}{avgQuizScore !== 'N/A' ? '%' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><HelpCircle size={20} color="#1a4d3e" /> Quiz Submissions</h3>
                                </div>

                                 {student.completed_lessons && student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).length > 0 ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).map((lesson: any) => (
                                            <div key={lesson.id} className="enrollment-row" style={{ marginBottom: 0 }}>
                                                <div className="progress-ring-mini" style={{ background: (lesson.pivot?.score || 0) >= (lesson.quiz_data?.pass_mark || 80) ? '#f0fdf4' : '#fef2f2', color: (lesson.pivot?.score || 0) >= (lesson.quiz_data?.pass_mark || 80) ? '#1a4d3e' : '#ef4444' }}>
                                                    {lesson.pivot?.score || 0}%
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1.05rem' }}>{lesson.title}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                                                        Submitted on {new Date(lesson.pivot?.updated_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn-secondary-outline" 
                                                    onClick={() => {
                                                        const quizData = typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data;
                                                        const answers = typeof lesson.pivot.answers === 'string' ? JSON.parse(lesson.pivot.answers) : lesson.pivot.answers;
                                                        setViewingQuizResult({ ...lesson, quiz_data: quizData, pivot: { ...lesson.pivot, answers } });
                                                    }}
                                                >
                                                    Analysis <Activity size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                        <HelpCircle size={24} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>No quiz submissions available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-records">
                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <div className="card-title-records" style={{ marginBottom: '1.5rem' }}>
                                    <h3>
                                        <ShieldCheck size={20} color="#1a4d3e" />
                                        Registration & Payment
                                    </h3>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Payment Status Badge */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>Status</span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 950,
                                            padding: '6px 14px',
                                            borderRadius: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em',
                                            ...(student.payment_status === 'approved' ? {
                                                background: '#f0fdf4',
                                                color: '#1a4d3e',
                                                border: '1px solid #bbf7d0'
                                            } : student.payment_status === 'rejected' ? {
                                                background: '#fef2f2',
                                                color: '#b91c1c',
                                                border: '1px solid #fecaca'
                                            } : {
                                                background: '#fffbeb',
                                                color: '#b45309',
                                                border: '1px solid #fde68a'
                                            })
                                        }}>
                                            {student.payment_status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* Selected Plan and Method */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Plan</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 850, color: '#0f172a', textTransform: 'capitalize' }}>
                                                {student.payment_plan ? student.payment_plan.replace('_', ' ') : 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Method</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 850, color: '#0f172a', textTransform: 'capitalize' }}>
                                                {student.payment_method ? student.payment_method : 'N/A'}
                                            </span>
                                        </div>
                                    </div>





                                    {/* Zelle Receipt Thumbnail */}
                                    {student.receipt_url && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Zelle Payment Receipt</span>
                                            <div 
                                                onClick={() => setPreviewReceipt(student.receipt_url)}
                                                style={{
                                                    position: 'relative',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: '1.5px solid #e2e8f0',
                                                    height: '140px',
                                                    background: '#f8fafc',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.3s'
                                                }}
                                                className="receipt-thumbnail-hover"
                                            >
                                                <img 
                                                    src={student.receipt_url} 
                                                    alt="Zelle Receipt" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(26, 77, 62, 0.4)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s',
                                                    fontWeight: 900,
                                                    fontSize: '0.85rem',
                                                    gap: '6px'
                                                }} className="receipt-overlay">
                                                    <Eye size={18} />
                                                    <span>Inspect Receipt</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Action Triggers */}
                                    {(student.payment_status === 'pending' || student.payment_status === 'rejected') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => setShowApproveModal(true)}
                                                disabled={approving || rejecting}
                                                style={{
                                                    width: '100%',
                                                    background: approving ? '#9ae6b4' : '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.85rem 1.25rem',
                                                    borderRadius: '16px',
                                                    fontWeight: 900,
                                                    fontSize: '0.9rem',
                                                    cursor: approving || rejecting ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                                    transition: 'all 0.3s'
                                                }}
                                                className="approve-btn-premium"
                                            >
                                                {approving ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        <span>Approving Payment...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} />
                                                        <span>Approve Payment & Send Email</span>
                                                    </>
                                                )}
                                            </button>

                                            {student.payment_status === 'pending' && (
                                                <button
                                                    onClick={() => setShowRejectModal(true)}
                                                    disabled={approving || rejecting}
                                                    style={{
                                                        width: '100%',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        border: '1.5px solid #fee2e2',
                                                        padding: '0.85rem 1.25rem',
                                                        borderRadius: '16px',
                                                        fontWeight: 900,
                                                        fontSize: '0.9rem',
                                                        cursor: approving || rejecting ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    className="reject-btn-premium"
                                                >
                                                    {rejecting ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={18} />
                                                            <span>Rejecting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X size={18} />
                                                            <span>Reject Payment</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem' }}>
                                <div className="card-title-records">
                                    <h3><Activity size={20} color="#1a4d3e" /> History Log</h3>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div className="activity-item">
                                        <div className="activity-content">
                                            <div>Account Activated</div>
                                            <span>{new Date(student.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {student.cohorts?.slice(0, 3).map((c: any) => (
                                        <div key={c.id} className="activity-item">
                                            <div className="activity-content">
                                                <div>Joined {c.name}</div>
                                                <span>{new Date(c.pivot?.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showDeactivateModal && (
                <div className="modal-overlay">
                    <div className="modal-box animate-fade-in-up">
                        <h3>Deactivate Access</h3>
                        <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            You are about to deactivate access for <strong>{student?.name}</strong>. Input a message explaining why (this will be sent to their email).
                        </p>
                        <textarea
                            placeholder="e.g. Your subscription has expired or you've completed the program curriculum..."
                            value={deactivateMessage}
                            onChange={(e) => setDeactivateMessage(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => {
                                setShowDeactivateModal(false);
                                setPendingCohortId(null);
                                setDeactivateMessage('');
                            }}>Cancel</button>
                            <button className="btn-confirm" onClick={confirmDeactivation}>Deactivate Access</button>
                        </div>
                    </div>
                </div>
            )}

            {viewingQuizResult && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-box animate-fade-in-up" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Evaluation Intelligence Analysis</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {viewingQuizResult.title} • Score: <span style={{ color: viewingQuizResult.pivot.score >= (viewingQuizResult.quiz_data?.pass_mark || 80) ? '#10b981' : '#ef4444' }}>{viewingQuizResult.pivot.score}%</span>
                                </p>
                            </div>
                            <button onClick={() => setViewingQuizResult(null)} style={{ background: 'white', border: '1.5px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                            {viewingQuizResult.quiz_data?.questions?.map((q: any, idx: number) => {
                                const studentAnswer = viewingQuizResult.pivot.answers[idx];
                                const isCorrect = studentAnswer === q.correct_answer;
                                
                                return (
                                    <div key={idx} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '20px', border: `1.5px solid ${isCorrect ? '#f0fdf4' : '#fef2f2'}`, background: isCorrect ? '#fcfdfe' : '#fffbff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Question {idx + 1}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isCorrect ? '#10b981' : '#ef4444', background: isCorrect ? '#f0fdf4' : '#fef2f2', padding: '4px 10px', borderRadius: '8px' }}>
                                                {isCorrect ? 'VALIDATED' : 'ERRONEOUS'}
                                            </span>
                                        </div>
                                        <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 850, color: '#0f172a', lineHeight: 1.4 }}>{q.question}</h4>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {q.options.map((opt: string, oIdx: number) => {
                                                const isStudentPick = studentAnswer === oIdx;
                                                const isRightAnswer = q.correct_answer === oIdx;
                                                
                                                return (
                                                    <div 
                                                        key={oIdx} 
                                                        style={{ 
                                                            padding: '1rem', 
                                                            borderRadius: '12px', 
                                                            background: isRightAnswer ? '#f0fdf4' : isStudentPick ? '#fef2f2' : 'white',
                                                            border: `1.2px solid ${isRightAnswer ? '#10b98140' : isStudentPick ? '#ef444440' : '#f1f5f9'}`,
                                                            color: isRightAnswer ? '#166534' : isStudentPick ? '#991b1b' : '#334155',
                                                            fontWeight: (isStudentPick || isRightAnswer) ? 800 : 500,
                                                            fontSize: '0.9rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {(isStudentPick || isRightAnswer) && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>}
                                                        </div>
                                                        {opt}
                                                        {isRightAnswer && <CheckCircle2 size={16} style={{ marginLeft: 'auto' }} />}
                                                        {!isCorrect && isStudentPick && <X size={16} style={{ marginLeft: 'auto' }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                            <button onClick={() => setViewingQuizResult(null)} className="btn-confirm" style={{ background: '#0f172a' }}>Close Analysis</button>
                        </div>
                    </div>
                </div>
            )}

            {previewReceipt && (
                <div 
                    className="modal-overlay" 
                    style={{ zIndex: 1200 }}
                    onClick={() => setPreviewReceipt(null)}
                >
                    <div 
                        className="modal-box animate-fade-in-up" 
                        style={{ 
                            maxWidth: '700px', 
                            maxHeight: '90vh', 
                            overflow: 'hidden', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: 0,
                            background: 'transparent',
                            boxShadow: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button 
                                onClick={() => setPreviewReceipt(null)} 
                                style={{ 
                                    background: 'rgba(15, 23, 42, 0.8)', 
                                    border: 'none', 
                                    color: 'white',
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ 
                            flex: 1, 
                            overflow: 'auto', 
                            background: 'white', 
                            borderRadius: '24px', 
                            padding: '1rem',
                            border: '1.5px solid #e2e8f0',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img 
                                src={previewReceipt} 
                                alt="Zelle Payment Receipt Full" 
                                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '16px' }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && (
                <div className="modal-overlay" style={{ zIndex: 1150 }}>
                    <div className="modal-box animate-fade-in-up" style={{ maxWidth: '480px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: '#f0fdf4',
                            color: '#1a4d3e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1.5px solid #dcfce7'
                        }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.4rem', fontWeight: 950, color: '#0f172a' }}>
                            Authorize Enrollment & Access
                        </h3>
                        <p style={{ color: '#64748b', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                            You are about to approve <strong>{student.name}</strong>'s payment. This will activate their profile and automatically trigger the following onboarding steps:
                        </p>
                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '1rem 1.25rem', 
                            borderRadius: '16px', 
                            border: '1px solid #f1f5f9', 
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span>Update payment status to <strong>Approved</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span>Generate secure login dashboard password</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span>Send email containing credentials & WhatsApp link</span>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="btn-cancel" onClick={() => setShowApproveModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleApprovePayment} style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', margin: 0, fontSize: '0.9rem', fontWeight: 850, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                                Approve & Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="modal-overlay" style={{ zIndex: 1150 }}>
                    <div className="modal-box animate-fade-in-up" style={{ maxWidth: '480px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1.5px solid #fee2e2'
                        }}>
                            <AlertCircle size={28} />
                        </div>
                        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.4rem', fontWeight: 950, color: '#0f172a' }}>
                            Reject Payment Receipt
                        </h3>
                        <p style={{ color: '#64748b', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Are you sure you want to mark <strong>{student.name}</strong>'s payment as rejected? This restricts access immediately. You can review and re-verify their file later if a new Zelle screenshot is uploaded.
                        </p>
                        <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="btn-cancel" onClick={() => setShowRejectModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleRejectPayment} style={{ background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', margin: 0, fontSize: '0.9rem', fontWeight: 850, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                                Yes, Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignCohortModal && (
                <div className="modal-overlay" style={{ zIndex: 1150 }}>
                    <div className="modal-box animate-fade-in-up" style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: '#f0fdf4',
                                    color: '#1a4d3e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1.5px solid #dcfce7'
                                }}>
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, color: '#0f172a' }}>
                                        Assign Academic Cohort
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                        Enroll {student.name} in standard learning programs
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowAssignCohortModal(false);
                                    setSelectedCohortIds([]);
                                }} 
                                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {loadingCohorts ? (
                            <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={32} color="#1a4d3e" style={{ margin: '0 auto' }} />
                                <p style={{ marginTop: '1rem', fontWeight: 800, color: '#64748b', fontSize: '0.85rem' }}>Loading active cohorts...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px', marginBottom: '1.5rem' }}>
                                    {allCohorts.filter((c: any) => !(student.cohorts || []).some((sc: any) => sc.id === c.id)).length > 0 ? (
                                        allCohorts.filter((c: any) => !(student.cohorts || []).some((sc: any) => sc.id === c.id)).map((cohort: any) => {
                                            const isSelected = selectedCohortIds.includes(cohort.id);
                                            return (
                                                <div 
                                                    key={cohort.id}
                                                    onClick={() => {
                                                        setSelectedCohortIds(prev => 
                                                            isSelected ? prev.filter(id => id !== cohort.id) : [...prev, cohort.id]
                                                        );
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 16px',
                                                        background: isSelected ? '#f0fdf4' : 'white',
                                                        border: `1.5px solid ${isSelected ? '#10b981' : '#f1f5f9'}`,
                                                        borderRadius: '16px',
                                                        marginBottom: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '6px',
                                                        border: `2px solid ${isSelected ? '#10b981' : '#cbd5e1'}`,
                                                        background: isSelected ? '#10b981' : 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 850, color: '#0f172a', fontSize: '0.9rem' }}>{cohort.name}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 650 }}>
                                                            {cohort.course?.title || 'General Curriculum'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1.5px dashed #e2e8f0' }}>
                                            <Info size={24} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                                            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>No other cohorts available</p>
                                            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', marginTop: '4px' }}>This student is already enrolled in all eligible cohorts.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button 
                                        className="btn-cancel" 
                                        onClick={() => {
                                            setShowAssignCohortModal(false);
                                            setSelectedCohortIds([]);
                                        }} 
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', margin: 0, fontSize: '0.85rem', fontWeight: 800 }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn-confirm" 
                                        disabled={selectedCohortIds.length === 0 || assigningCohorts}
                                        onClick={handleAssignCohorts} 
                                        style={{ 
                                            background: selectedCohortIds.length === 0 ? '#cbd5e1' : '#10b981', 
                                            color: 'white', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            height: '44px', 
                                            margin: 0, 
                                            fontSize: '0.85rem', 
                                            fontWeight: 850, 
                                            boxShadow: selectedCohortIds.length === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                                            cursor: selectedCohortIds.length === 0 || assigningCohorts ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {assigningCohorts ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} style={{ marginRight: '6px' }} />
                                                <span>Assigning...</span>
                                            </>
                                        ) : (
                                            <span>Confirm Assignment ({selectedCohortIds.length})</span>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
