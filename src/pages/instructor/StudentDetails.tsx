import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
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
    Info,
    RotateCcw,
    GraduationCap,
    XCircle,
    Key,
    Send,
    Edit,
    DollarSign,
    CreditCard,
    Tag,
    FileText,
    ExternalLink
} from 'lucide-react';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateMessage, setDeactivateMessage] = useState('');
    const [pendingCohortId, setPendingCohortId] = useState<string | null>(null);
    const [viewingQuizResult, setViewingQuizResult] = useState<any>(null);
    const [notification, _setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const setNotification = (notif: { type: 'success' | 'error', message: string } | null) => {
        _setNotification(notif);
        if (notif) {
            Swal.fire({
                icon: notif.type,
                title: notif.type === 'success' ? 'Success' : 'Error',
                text: notif.message,
                confirmButtonColor: 'var(--index-primary-color)',
                timer: notif.type === 'success' ? 2500 : undefined,
                showConfirmButton: notif.type !== 'success'
            });
        }
    };

    const [sendingCredentials, setSendingCredentials] = useState(false);
    const [updatingPlan, setUpdatingPlan] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Cohort Assignment states
    const [showAssignCohortModal, setShowAssignCohortModal] = useState(false);
    const [allCohorts, setAllCohorts] = useState<any[]>([]);
    const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
    const [loadingCohorts, setLoadingCohorts] = useState(false);
    const [assigningCohorts, setAssigningCohorts] = useState(false);

    // Certificate generation states
    const [certificates, setCertificates] = useState<any[]>([]);
    const [showIssueCertModal, setShowIssueCertModal] = useState(false);
    const [issuingCert, setIssuingCert] = useState(false);
    const [isReassign, setIsReassign] = useState(false);
    const [selectedCohortForCert, setSelectedCohortForCert] = useState<any>(null);
    const [certForm, setCertForm] = useState({
        fullName: '',
        courseTitle: '',
        issuedAt: '',
        issuedBy: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleApprovePayment = async () => {
        if (!student) return;
        const result = await Swal.fire({
            title: 'Approve Registration & Payment',
            html: `
                <div style="text-align: left; font-size: 0.88rem; line-height: 1.6; color: var(--index-text-secondary);">
                    <p style="margin-bottom: 0.75rem;">This will mark the student's status as <strong style="color: var(--lgl-success);">Approved / Verified</strong> and unlock full platform features.</p>
                    <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: var(--index-hover-bg); border-radius: 12px; border: 1.5px solid var(--index-border-subtle);">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 750; font-size: 0.85rem; color: var(--index-text-heading);">
                            <input type="checkbox" id="swal-send-email" checked style="width: 17px; height: 17px; accent-color: var(--index-primary-color); cursor: pointer;" />
                            Send Welcome Email with login credentials to ${student.email}
                        </label>
                        <p style="margin: 4px 0 0 27px; font-size: 0.75rem; color: var(--index-text-faint);">Uncheck if you want to approve silently without emailing the student.</p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirm Approval',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'var(--lgl-success)',
            cancelButtonColor: 'var(--index-text-faint)',
            preConfirm: () => {
                const checkbox = document.getElementById('swal-send-email') as HTMLInputElement;
                return { sendEmail: checkbox ? checkbox.checked : false };
            }
        });

        if (!result.isConfirmed) return;
        const sendEmail = result.value?.sendEmail ?? false;

        setUpdatingStatus(true);
        try {
            const response = await fetch(`${API_URL}/instructor/students/${id}/approve-payment`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    send_email: sendEmail,
                    password: 'password123'
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: data.message || (sendEmail ? 'Registration approved and welcome email dispatched!' : 'Registration approved silently without sending email.')
                });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to approve payment.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setUpdatingStatus(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleRejectPayment = async () => {
        if (!student) return;
        const result = await Swal.fire({
            title: 'Decline / Reject Registration?',
            text: `This will mark the student's status as Rejected and lock platform features for ${student.name}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Reject Payment',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'var(--lgl-error)',
            cancelButtonColor: 'var(--index-text-faint)'
        });

        if (!result.isConfirmed) return;

        setUpdatingStatus(true);
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
                setNotification({ type: 'success', message: data.message || 'Registration marked as rejected.' });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to reject payment.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setUpdatingStatus(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleChangePaymentStatus = async (newStatus: string) => {
        if (!student || student.payment_status === newStatus) return;

        setUpdatingStatus(true);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: student.name,
                    email: student.email,
                    payment_status: newStatus,
                    payment_plan: student.payment_plan || 'full',
                    payment_tracking_enabled: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%'),
                    cohorts: student.cohorts?.map((c: any) => c.id) || []
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: `Registration status updated to "${newStatus.toUpperCase()}".`
                });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to update payment status.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setUpdatingStatus(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleSendCredentials = async () => {
        if (!student) return;
        const result = await Swal.fire({
            title: 'Send Login Credentials?',
            text: `This will set the temporary password to "password123" and email login instructions to ${student.email}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send Email',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'var(--index-primary-color)'
        });

        if (!result.isConfirmed) return;

        setSendingCredentials(true);
        try {
            const response = await fetch(`${API_URL}/instructor/students/${id}/send-credentials`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ password: 'password123' })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: data.message || 'Login credentials email dispatched successfully!' });
            } else {
                throw new Error(data.message || 'Failed to send credentials.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setSendingCredentials(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleTogglePaymentPlan = async (newPlan: 'full' | 'installment') => {
        if (!student) return;
        const isInstallment = newPlan === 'installment';
        const result = await Swal.fire({
            title: isInstallment ? 'Switch to 50% Installment Plan?' : 'Mark as 100% Fully Paid?',
            text: isInstallment
                ? 'This will enable tuition tracking and activate the deadline reminder on the student dashboard.'
                : 'This will mark the student as fully paid and clear the tuition reminder countdown.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: isInstallment ? 'Enable 50% Tracking' : 'Confirm 100% Paid',
            cancelButtonText: 'Cancel',
            confirmButtonColor: isInstallment ? '#d97706' : 'var(--lgl-success)'
        });

        if (!result.isConfirmed) return;

        setUpdatingPlan(true);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: student.name,
                    email: student.email,
                    payment_plan: newPlan,
                    payment_tracking_enabled: isInstallment,
                    payment_status: 'approved',
                    cohorts: student.cohorts?.map((c: any) => c.id) || []
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: isInstallment
                        ? 'Updated to 50% Installment Plan. Tuition reminder active.'
                        : 'Updated to 100% Full Payment. Tuition reminder cleared!'
                });
                fetchStudentData();
            } else {
                throw new Error(data.message || 'Failed to update payment plan.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setUpdatingPlan(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const fetchCertificates = async () => {
        try {
            const response = await fetch(`${API_URL}/certificates`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const studentCerts = data.filter((c: any) => c.user_id === parseInt(id || ''));
                setCertificates(studentCerts);
            }
        } catch (err) {
            console.error("Error fetching certificates:", err);
        }
    };

    const handleOpenIssueCertModal = (cohort: any) => {
        setIsReassign(false);
        setSelectedCohortForCert(cohort);
        setCertForm({
            fullName: student?.name || '',
            courseTitle: cohort.course?.title || '',
            issuedAt: new Date().toISOString().substring(0, 10),
            issuedBy: user?.name || 'Instructor'
        });
        setShowIssueCertModal(true);
    };

    const handleOpenReassignModal = (cohort: any, existingCert: any) => {
        setIsReassign(true);
        setSelectedCohortForCert(cohort);
        setCertForm({
            fullName: existingCert.full_name || student?.name || '',
            courseTitle: existingCert.course_title || cohort.course?.title || '',
            issuedAt: existingCert.issued_at?.substring(0, 10) || new Date().toISOString().substring(0, 10),
            issuedBy: existingCert.issued_by || user?.name || 'Instructor'
        });
        setShowIssueCertModal(true);
    };

    const handleIssueCertificate = async () => {
        if (!selectedCohortForCert) return;
        setIssuingCert(true);
        try {
            const response = await fetch(`${API_URL}/instructor/certificates/generate-manual`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    course_id: selectedCohortForCert.course_id || selectedCohortForCert.course?.id,
                    cohort_id: selectedCohortForCert.id,
                    user_id: student.id,
                    full_name: certForm.fullName,
                    course_title: certForm.courseTitle,
                    issued_at: certForm.issuedAt,
                    issued_by: certForm.issuedBy
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotification({ type: 'success', message: isReassign ? 'Certificate reassigned successfully! Student will receive a new email.' : 'Certificate generated and issued successfully!' });
                fetchCertificates();
                setShowIssueCertModal(false);
            } else {
                throw new Error(data.message || 'Failed to issue certificate.');
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message });
        } finally {
            setIssuingCert(false);
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
        fetchCertificates();
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
                    background: var(--lgl-success) !important;
                    box-shadow: 0 6px 16px color-mix(in srgb, var(--index-primary-color) 30%, transparent) !important;
                }
                .approve-btn-premium:active {
                    transform: translateY(0);
                }
                .reject-btn-premium:hover {
                    background: var(--index-danger-bg-soft) !important;
                    border-color: color-mix(in srgb, var(--lgl-error) 45%, transparent) !important;
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
                    color: var(--index-text-secondary);
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
                    color: var(--index-text-heading);
                    transform: translateX(-4px);
                }

                .staff-scope .profile-header-premium {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
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
                    background: linear-gradient(135deg, var(--index-primary-color), var(--index-primary-hover));
                    border-radius: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3.5rem;
                    font-weight: 950;
                    box-shadow: 0 20px 40px -10px color-mix(in srgb, var(--index-primary-color) calc(0.3 * 100%), transparent);
                }

                .profile-info h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                    letter-spacing: -0.04em;
                }

                .staff-scope .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    background: color-mix(in srgb, var(--lgl-success) 12%, transparent);
                    color: var(--index-primary-color);
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
                    color: var(--index-text-secondary);
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
                    border: 1.5px solid var(--index-hover-bg);
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
                    color: var(--index-text-heading);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .staff-scope .enrollment-row {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 20px;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }

                .enrollment-row:hover {
                    border-color: var(--index-primary-color);
                    background: white;
                    transform: translateY(-2px);
                }

                .staff-scope .progress-ring-mini {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    background: color-mix(in srgb, var(--lgl-success) 12%, transparent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--index-primary-color);
                    font-weight: 950;
                    font-size: 0.9rem;
                }

                .staff-scope .activity-item {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 1.5rem;
                    border-left: 2px solid var(--index-hover-bg);
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
                    border: 2px solid var(--index-primary-color);
                    border-radius: 50%;
                }

                .activity-content div {
                    font-weight: 850;
                    color: var(--index-text-heading);
                    font-size: 0.95rem;
                }

                .activity-content span {
                    color: var(--index-text-faint);
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .staff-scope .btn-secondary-outline {
                    background: transparent;
                    color: var(--index-text-secondary);
                    border: 1.5px solid var(--index-hover-bg);
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
                    background: var(--index-hover-bg);
                    border-color: var(--index-text-faint);
                }

                .staff-scope .btn-toggle-active {
                    background: color-mix(in srgb, var(--lgl-success) 12%, transparent);
                    color: var(--index-primary-color);
                    border: 1.5px solid color-mix(in srgb, var(--lgl-success) 15%, transparent);
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-toggle-active:hover {
                    background: color-mix(in srgb, var(--lgl-success) 15%, transparent);
                }

                .staff-scope .btn-toggle-inactive {
                    background: var(--index-danger-bg-soft);
                    color: var(--lgl-error);
                    border: 1.5px solid var(--index-danger-bg-soft);
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-toggle-inactive:hover {
                    background: var(--index-danger-bg-soft);
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
                    color: var(--index-text-heading);
                    font-size: 1.5rem;
                }

                .modal-box textarea {
                    width: 100%;
                    height: 120px;
                    padding: 1rem;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                    font-family: inherit;
                    resize: none;
                }

                .modal-box textarea:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                }

                .staff-scope .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .staff-scope .btn-confirm {
                    background: var(--lgl-error);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .staff-scope .btn-cancel {
                    background: var(--index-hover-bg);
                    color: var(--index-text-secondary);
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
                    background: notification.type === 'success' ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-danger-bg-soft)',
                    border: `1px solid ${notification.type === 'success' ? 'color-mix(in srgb, var(--lgl-success) 35%, transparent)' : 'var(--index-danger-bg-soft)'}`,
                    color: notification.type === 'success' ? 'var(--lgl-success)' : 'var(--lgl-error)',
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
                        <X size={16} color={notification.type === 'success' ? 'var(--lgl-success)' : 'var(--lgl-error)'} />
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '8rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>Loading Profile...</p>
                </div>
            ) : error || !student ? (
                <div style={{ padding: '4rem', background: 'var(--index-danger-bg-soft)', borderRadius: '32px', border: '1.5px solid var(--index-danger-bg-soft)', textAlign: 'center' }}>
                    <AlertCircle size={40} color="var(--lgl-error)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: 'var(--index-text-heading)', fontWeight: 950 }}>Student Not Found</h3>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, margin: '8px 0 2rem' }}>{error || 'Unable to load student details.'}</p>
                    <button onClick={fetchStudentData} className="back-link" style={{ margin: '0 auto' }}>Try Again</button>
                </div>
            ) : (
                <>
                    <div className="profile-header-premium shadow-premium">
                        <div className="avatar-massive">
                            {student.name.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <div className="status-pill" style={{
                                    background: student.payment_status === 'approved' ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : student.payment_status === 'rejected' ? 'var(--index-danger-bg-soft)' : 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)',
                                    color: student.payment_status === 'approved' ? 'var(--lgl-success)' : student.payment_status === 'rejected' ? 'var(--lgl-error)' : 'var(--lgl-warning)',
                                    borderColor: student.payment_status === 'approved' ? 'color-mix(in srgb, var(--lgl-success) 35%, transparent)' : 'transparent'
                                }}>
                                    <ShieldCheck size={16} /> {student.payment_status === 'approved' ? 'Verified Active Student' : student.payment_status === 'rejected' ? 'Declined / Inactive' : 'Pending Verification'}
                                </div>
                                <div className="status-pill" style={{ background: 'color-mix(in srgb, var(--index-primary-color) 12%, transparent)', color: 'var(--index-primary-color)', borderColor: 'color-mix(in srgb, var(--index-primary-color) 25%, transparent)' }}>
                                    <BookOpen size={16} /> {student.course_name || 'General Program'}
                                </div>
                                <div className="status-pill" style={{ background: 'var(--index-hover-bg)', color: 'var(--index-text-heading)' }}>
                                    <GraduationCap size={16} /> {student.education_level || 'Education Unspecified'}
                                </div>
                                <div className="status-pill" style={{
                                    background: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                        ? 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)'
                                        : 'color-mix(in srgb, var(--lgl-success) 12%, transparent)',
                                    color: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                        ? 'var(--lgl-warning)'
                                        : 'var(--lgl-success)',
                                    borderColor: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                        ? 'color-mix(in srgb, var(--lgl-warning) 35%, transparent)'
                                        : 'color-mix(in srgb, var(--lgl-success) 35%, transparent)'
                                }}>
                                    <Clock size={16} /> {(student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%') ? '50% Installment (Reminder Active)' : '100% Fully Paid'}
                                </div>
                            </div>
                            <h1>{student.name}</h1>
                            <div className="contact-grid-mini">
                                <div className="contact-item-mini"><Mail size={18} /> {student.email}</div>
                                {student.phone && <div className="contact-item-mini"><Phone size={18} /> {student.phone}</div>}
                                <div className="contact-item-mini"><Calendar size={18} /> Member since {new Date(student.created_at).toLocaleDateString()}</div>
                                <div className="contact-item-mini"><MapPin size={18} /> {[student.city, student.state, student.country].filter(Boolean).join(', ') || 'Student Access'}</div>
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                            <button
                                onClick={() => navigate(`/instructor/students/${id}/edit`)}
                                className="btn-secondary-outline"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.4rem', borderRadius: '16px', fontWeight: 850, fontSize: '0.9rem', background: 'var(--index-card-bg)' }}
                            >
                                <Edit size={16} /> Edit Student
                            </button>
                        </div>
                    </div>

                    <div className="details-layout">
                        <div className="main-records">
                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><BookOpen size={20} color="var(--index-primary-color)" /> Academic Enrollments</h3>
                                    {student?.payment_status !== 'rejected' && (
                                        <button 
                                            className="btn-secondary-outline" 
                                            onClick={() => {
                                                setShowAssignCohortModal(true);
                                                fetchCohorts();
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--lgl-success)', color: 'var(--index-primary-color)', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' }}
                                        >
                                            <Plus size={16} /> Assign Cohort
                                        </button>
                                    )}
                                </div>

                                {student.cohorts && student.cohorts.length > 0 ? student.cohorts.map((cohort: any) => {
                                    const matchingCert = certificates.find((c: any) => c.course_id === cohort.course?.id);
                                    const examSubmission = student.exam_submissions?.find((s: any) => s.cohort_id === cohort.id);
                                    return (
                                        <div key={cohort.id} style={{ marginBottom: '1rem' }}>
                                            <div className="enrollment-row" style={{ marginBottom: 0, borderRadius: expandedCohortMap[cohort.id] ? '20px 20px 0 0' : '20px' }}>
                                                <div className="progress-ring-mini">{Math.round(cohort.pivot?.progress || 0)}%</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 950, color: 'var(--index-text-heading)', fontSize: '1.1rem' }}>{cohort.name}</div>
                                                    <div style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        {cohort.course?.title || 'General Curriculum'} • Joined {new Date(cohort.pivot?.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 850,
                                                            color: cohort.pivot?.status === 'inactive' ? 'var(--lgl-error)' : 'var(--lgl-success)',
                                                            background: cohort.pivot?.status === 'inactive' ? 'var(--index-danger-bg-soft)' : 'color-mix(in srgb, var(--lgl-success) 12%, transparent)',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {cohort.pivot?.status?.toUpperCase() || 'ENROLLED'}
                                                        </div>
                                                        {matchingCert && (
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 850,
                                                                color: 'var(--lgl-cyan-dark)',
                                                                background: 'var(--index-accent-soft-bg)',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <Award size={12} /> CERTIFICATE ISSUED
                                                            </div>
                                                        )}
                                                        {cohort.exam_enabled && (
                                                            examSubmission ? (
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 850,
                                                                    color: examSubmission.passed ? 'var(--lgl-success)' : 'var(--lgl-error)',
                                                                    background: examSubmission.passed ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-danger-bg-soft)',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    {examSubmission.passed ? <GraduationCap size={12} /> : <XCircle size={12} />}
                                                                    {examSubmission.passed ? 'EXAM PASSED' : 'EXAM FAILED'} ({examSubmission.score}%)
                                                                </div>
                                                            ) : (
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 850,
                                                                    color: 'var(--lgl-warning)',
                                                                    background: 'color-mix(in srgb, var(--lgl-warning) 12%, transparent)',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <GraduationCap size={12} /> EXAM PENDING
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {matchingCert ? (
                                                        <>
                                                            <a 
                                                                href={matchingCert.certificate_path} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="btn-secondary-outline"
                                                                style={{ textDecoration: 'none', background: 'var(--index-accent-soft-bg)', color: 'var(--lgl-cyan-dark)', borderColor: 'color-mix(in srgb, var(--lgl-cyan-dark) 35%, transparent)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                            >
                                                                View Cert <Award size={14} />
                                                            </a>
                                                            <button
                                                                className="btn-secondary-outline"
                                                                onClick={() => handleOpenReassignModal(cohort, matchingCert)}
                                                                title="Regenerate and reassign this certificate"
                                                                style={{ background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)', color: 'var(--lgl-warning)', borderColor: 'color-mix(in srgb, var(--lgl-warning) 35%, transparent)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                            >
                                                                Reassign <RotateCcw size={14} />
                                                            </button>
                                                        </>
                                                    ) : cohort.course ? (
                                                        <button 
                                                            className="btn-secondary-outline" 
                                                            onClick={() => handleOpenIssueCertModal(cohort)}
                                                            style={{ background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)', color: 'var(--lgl-warning)', borderColor: 'color-mix(in srgb, var(--lgl-warning) 35%, transparent)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            Issue Cert <Award size={14} />
                                                        </button>
                                                    ) : null}
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
                                                <div className="animate-fade-in-up" style={{ padding: '2.5rem', background: 'var(--index-hover-bg)', border: '1.5px solid var(--index-border-subtle)', borderTop: 'none', borderRadius: '0 0 20px 20px', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.02)' }}>
                                                    <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--index-text-heading)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CheckCircle2 size={18} color="var(--index-primary-color)" /> Curriculum Override Access
                                                    </h4>
                                                    <p style={{ margin: '0 0 2rem 0', color: 'var(--index-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Toggle the checkboxes below to manually apply or revoke completion status for a specific resource. This persists immediately to the backend and adjusts percentages automatically.</p>
                                                    
                                                    {cohort.course?.modules?.map((mod: any) => (
                                                        <div key={mod.id} style={{ marginBottom: '1.5rem', background: 'var(--index-card-bg)', border: '1.5px solid var(--index-border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                                                            <div style={{ fontWeight: 800, color: 'var(--index-primary-color)', padding: '1rem 1.5rem', background: 'var(--index-hover-bg)', fontSize: '0.95rem', borderBottom: '1px solid var(--index-border-color)' }}>{mod.title}</div>
                                                            <div style={{ display: 'grid', padding: '1rem' }}>
                                                                {mod.lessons?.map((lesson: any) => {
                                                                    const isCompleted = student?.completed_lessons?.some((cl: any) => cl.id === lesson.id);
                                                                    return (
                                                                        <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--index-border-subtle)' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                                <button 
                                                                                    onClick={() => toggleLessonCompletion(lesson.id, !!isCompleted)}
                                                                                    style={{ width: '26px', height: '26px', borderRadius: '8px', border: `2px solid ${isCompleted ? 'var(--lgl-success)' : 'var(--index-text-faint)'}`, background: isCompleted ? 'var(--lgl-success)' : 'var(--index-card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }}
                                                                                >
                                                                                    {isCompleted && <CheckCircle2 size={16} color="white" />}
                                                                                </button>
                                                                                <span style={{ fontWeight: 700, color: isCompleted ? 'var(--index-text-faint)' : 'var(--index-text-secondary)', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none', transition: 'all 0.2s' }}>{lesson.title}</span>
                                                                            </div>
                                                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase', background: 'var(--index-hover-bg)', padding: '4px 8px', borderRadius: '6px' }}>{lesson.type}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {(!mod.lessons || mod.lessons.length === 0) && (
                                                                    <p style={{ margin: '0.5rem 1rem', color: 'var(--index-text-faint)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 600 }}>No lessons active in module...</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!cohort.course?.modules || cohort.course.modules.length === 0) && (
                                                        <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>No curriculum data bound to this record.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--index-hover-bg)', borderRadius: '24px', border: '2px dashed var(--index-border-color)' }}>
                                        <BookOpen size={32} color="var(--index-text-faint)" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>No course enrollments found for this student.</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><Award size={20} color="var(--index-primary-color)" /> Learning Metrics</h3>
                                </div>
                                <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'var(--index-hover-bg)', borderRadius: '20px', textAlign: 'center' }}>
                                        <TrendingUp size={24} color="var(--index-primary-color)" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: 'var(--index-text-faint)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Avg. Completion</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>
                                            {avgCompletion}%
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'var(--index-hover-bg)', borderRadius: '20px', textAlign: 'center' }}>
                                        <Clock size={24} color="var(--index-primary-color)" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: 'var(--index-text-faint)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Total Cohorts</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>{student.cohorts?.length || 0}</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'var(--index-hover-bg)', borderRadius: '20px', textAlign: 'center' }}>
                                        <Activity size={24} color="var(--index-primary-color)" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: 'var(--index-text-faint)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Avg. Quiz Score</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>
                                            {avgQuizScore}{avgQuizScore !== 'N/A' ? '%' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><HelpCircle size={20} color="var(--index-primary-color)" /> Quiz Submissions</h3>
                                </div>

                                 {student.completed_lessons && student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).length > 0 ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).map((lesson: any) => (
                                            <div key={lesson.id} className="enrollment-row" style={{ marginBottom: 0 }}>
                                                <div className="progress-ring-mini" style={{ background: (lesson.pivot?.score || 0) >= (lesson.quiz_data?.pass_mark || 80) ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-danger-bg-soft)', color: (lesson.pivot?.score || 0) >= (lesson.quiz_data?.pass_mark || 80) ? 'var(--index-primary-color)' : 'var(--lgl-error)' }}>
                                                    {lesson.pivot?.score || 0}%
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 950, color: 'var(--index-text-heading)', fontSize: '1.05rem' }}>{lesson.title}</div>
                                                    <div style={{ color: 'var(--index-text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
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
                                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--index-hover-bg)', borderRadius: '20px', border: '2px dashed var(--index-border-color)' }}>
                                        <HelpCircle size={24} color="var(--index-text-faint)" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>No quiz submissions available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-records">
                            {/* Card 1: Registration & Payment */}
                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <div className="card-title-records" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>
                                        <CreditCard size={20} color="var(--index-primary-color)" />
                                        Registration & Payment
                                    </h3>
                                    {updatingStatus && <Loader2 size={18} className="animate-spin" color="var(--index-primary-color)" />}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Payment Status Badge & Quick Dropdown Switcher */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--index-border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>Current Status</span>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 950,
                                                padding: '6px 14px',
                                                borderRadius: '10px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em',
                                                ...(student.payment_status === 'approved' ? {
                                                    background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)',
                                                    color: 'var(--index-primary-color)',
                                                    border: '1px solid color-mix(in srgb, var(--lgl-success) 35%, transparent)'
                                                } : student.payment_status === 'rejected' ? {
                                                    background: 'var(--index-danger-bg-soft)',
                                                    color: 'var(--lgl-error)',
                                                    border: '1px solid color-mix(in srgb, var(--lgl-error) 35%, transparent)'
                                                } : {
                                                    background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)',
                                                    color: 'var(--lgl-warning)',
                                                    border: '1px solid color-mix(in srgb, var(--lgl-warning) 35%, transparent)'
                                                })
                                            }}>
                                                {student.payment_status === 'approved' ? 'Approved / Active' : student.payment_status === 'rejected' ? 'Rejected' : 'Pending Review'}
                                            </span>
                                        </div>

                                        {/* Status Switcher Dropdown */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--index-text-faint)' }}>Change Status</label>
                                            <select
                                                value={student.payment_status || 'pending'}
                                                onChange={(e) => handleChangePaymentStatus(e.target.value)}
                                                disabled={updatingStatus}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.65rem 0.85rem',
                                                    borderRadius: '10px',
                                                    border: '1.5px solid var(--index-border-color)',
                                                    background: 'var(--index-card-bg)',
                                                    color: 'var(--index-text-heading)',
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem',
                                                    cursor: updatingStatus ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <option value="approved">Approved / Verified (Full Access)</option>
                                                <option value="pending">Pending Verification / Review</option>
                                                <option value="rejected">Rejected / Inactive (Lock Access)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Quick Approve & Quick Reject */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {student.payment_status !== 'approved' && (
                                            <button
                                                onClick={handleApprovePayment}
                                                disabled={updatingStatus}
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--lgl-success)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.8rem 1.25rem',
                                                    borderRadius: '14px',
                                                    fontWeight: 850,
                                                    fontSize: '0.88rem',
                                                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    boxShadow: '0 4px 12px color-mix(in srgb, var(--lgl-success) 25%, transparent)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                <span>Approve & Activate Registration</span>
                                            </button>
                                        )}

                                        {student.payment_status !== 'rejected' && (
                                            <button
                                                onClick={handleRejectPayment}
                                                disabled={updatingStatus}
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--index-danger-bg-soft)',
                                                    color: 'var(--lgl-error)',
                                                    border: '1.5px solid color-mix(in srgb, var(--lgl-error) 25%, transparent)',
                                                    padding: '0.7rem 1.25rem',
                                                    borderRadius: '14px',
                                                    fontWeight: 800,
                                                    fontSize: '0.84rem',
                                                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                <span>Decline / Reject Registration</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Rejected Warning Notice */}
                                    {student.payment_status === 'rejected' && (
                                        <div style={{
                                            padding: '0.85rem 1rem',
                                            borderRadius: '12px',
                                            background: 'var(--index-danger-bg-soft)',
                                            border: '1px solid color-mix(in srgb, var(--lgl-error) 25%, transparent)',
                                            color: 'var(--lgl-error)',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            lineHeight: 1.4
                                        }}>
                                            ⚠️ This student's registration is declined. Platform access and cohort enrollments are locked. Click "Approve & Activate Registration" above to restore access.
                                        </div>
                                    )}

                                    {/* Payment Receipt Inspection Box */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--index-border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--index-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Receipt</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {student.receipt_url && (
                                                <a
                                                    href={student.receipt_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        flex: 1,
                                                        minWidth: '130px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        padding: '0.6rem 0.85rem',
                                                        borderRadius: '10px',
                                                        background: 'var(--index-card-bg)',
                                                        border: '1px solid var(--index-border-color)',
                                                        color: 'var(--index-primary-color)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    <FileText size={15} /> Attached Receipt <ExternalLink size={13} />
                                                </a>
                                            )}
                                            <a
                                                href={`${API_URL}/receipts/${student.id}/image`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    flex: 1,
                                                    minWidth: '130px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '0.6rem 0.85rem',
                                                    borderRadius: '10px',
                                                    background: 'color-mix(in srgb, var(--index-primary-color) 8%, transparent)',
                                                    border: '1px solid color-mix(in srgb, var(--index-primary-color) 25%, transparent)',
                                                    color: 'var(--index-primary-color)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 800
                                                }}
                                            >
                                                <CreditCard size={15} /> Digital Receipt <ExternalLink size={13} />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Selected Plan */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--index-text-faint)', display: 'block', marginBottom: '2px' }}>Tuition Plan</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 850, color: 'var(--index-text-heading)', textTransform: 'capitalize' }}>
                                            {(student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%') ? '50% Installment Payment' : '100% Full Payment'}
                                        </span>
                                    </div>

                                    {/* Coupon Code if exists */}
                                    {student.coupon_code && (
                                        <div style={{ background: 'var(--index-hover-bg)', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--index-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Tag size={14} color="var(--index-primary-color)" /> Coupon Applied
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--index-primary-color)', background: 'color-mix(in srgb, var(--index-primary-color) 10%, transparent)', padding: '2px 8px', borderRadius: '6px' }}>
                                                {student.coupon_code}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tuition Reminder State & Quick Switch Box */}
                                    <div style={{
                                        padding: '1.25rem',
                                        borderRadius: '18px',
                                        border: '1.5px solid',
                                        borderColor: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                            ? 'color-mix(in srgb, var(--lgl-warning) 35%, transparent)'
                                            : 'color-mix(in srgb, var(--lgl-success) 35%, transparent)',
                                        background: (student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                            ? 'color-mix(in srgb, var(--lgl-warning) 8%, transparent)'
                                            : 'color-mix(in srgb, var(--lgl-success) 8%, transparent)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            {(student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%') ? (
                                                <>
                                                    <Clock size={18} color="var(--lgl-warning)" />
                                                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--lgl-warning)' }}>50% Installment Reminder Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} color="var(--lgl-success)" />
                                                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--lgl-success)' }}>100% Fully Paid (No Reminders)</span>
                                                </>
                                            )}
                                        </div>
                                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--index-text-secondary)', lineHeight: 1.45, fontWeight: 600 }}>
                                            {(student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%')
                                                ? "This student paid 50% down. The remaining tuition countdown reminder and balance checkout are currently active on their student dashboard."
                                                : "This student is fully paid. No balance countdown or access locks apply to their account."}
                                        </p>
                                        
                                        {(student.payment_plan === 'installment' || student.payment_plan === '50_percent' || student.payment_plan === '50%') ? (
                                            <button
                                                onClick={() => handleTogglePaymentPlan('full')}
                                                disabled={updatingPlan}
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--lgl-success)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.7rem 1rem',
                                                    borderRadius: '12px',
                                                    fontWeight: 850,
                                                    fontSize: '0.825rem',
                                                    cursor: updatingPlan ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {updatingPlan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                <span>Mark as 100% Fully Paid (Clear Reminder)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleTogglePaymentPlan('installment')}
                                                disabled={updatingPlan}
                                                style={{
                                                    width: '100%',
                                                    background: 'transparent',
                                                    color: 'var(--lgl-warning)',
                                                    border: '1.5px solid var(--lgl-warning)',
                                                    padding: '0.7rem 1rem',
                                                    borderRadius: '12px',
                                                    fontWeight: 850,
                                                    fontSize: '0.825rem',
                                                    cursor: updatingPlan ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {updatingPlan ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                                                <span>Switch to 50% Installment Plan</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Send Credentials Button */}
                                    <button
                                        onClick={handleSendCredentials}
                                        disabled={sendingCredentials}
                                        style={{
                                            width: '100%',
                                            background: 'var(--index-hover-bg)',
                                            color: 'var(--index-text-heading)',
                                            border: '1.5px solid var(--index-border-color)',
                                            padding: '0.85rem 1.25rem',
                                            borderRadius: '16px',
                                            fontWeight: 850,
                                            fontSize: '0.88rem',
                                            cursor: sendingCredentials ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {sendingCredentials ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Dispatching Credentials...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Key size={16} color="var(--index-primary-color)" />
                                                <span>Send / Resend Login Credentials</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Card 2: Academic & Student Profile Details */}
                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <div className="card-title-records" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>
                                        <Info size={20} color="var(--index-primary-color)" />
                                        Academic & Profile Details
                                    </h3>
                                    <button 
                                        onClick={() => navigate(`/instructor/students/${id}/edit`)}
                                        style={{ background: 'none', border: 'none', color: 'var(--index-primary-color)', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                    {/* Program Track */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Course / Program Track</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 850, color: 'var(--index-text-heading)' }}>
                                            {student.course_name || 'Foundation Academy'}
                                        </span>
                                    </div>

                                    {/* Education Level */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Education Level</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 850, color: 'var(--index-text-heading)' }}>
                                            {student.education_level || 'Not provided'}
                                        </span>
                                    </div>

                                    {/* Phone Number */}
                                    {student.phone && (
                                        <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Telephone</span>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 850, color: 'var(--index-text-heading)' }}>
                                                {student.phone}
                                            </span>
                                        </div>
                                    )}

                                    {/* Address Details */}
                                    {(student.address_line1 || student.city || student.country) && (
                                        <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Residential Address</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--index-text-heading)', lineHeight: 1.45, display: 'block' }}>
                                                {[student.address_line1, student.address_line2, student.city, student.state, student.zip, student.country].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {/* How Heard */}
                                    <div style={{ background: 'var(--index-hover-bg)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--index-border-subtle)' }}>
                                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Discovery Channel</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 850, color: 'var(--index-text-heading)', textTransform: 'capitalize' }}>
                                            {student.hear_source ? (student.hear_source === 'referral' ? 'Friend / Referral' : student.hear_source) : 'Not specified'}
                                        </span>
                                    </div>

                                    {/* Referral Information Card */}
                                    {(student.referral_name || student.referral_email || student.hear_source === 'referral') && (
                                        <div style={{ background: 'color-mix(in srgb, var(--index-primary-color) 4%, transparent)', padding: '1rem', borderRadius: '16px', border: '1.5px dashed color-mix(in srgb, var(--index-primary-color) 25%, transparent)' }}>
                                            <span style={{ fontSize: '0.725rem', fontWeight: 900, color: 'var(--index-primary-color)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                                                Referral Details
                                            </span>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--index-text-secondary)', display: 'block' }}>Referred by:</span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 850, color: 'var(--index-text-heading)' }}>
                                                        {student.referral_name || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--index-text-secondary)', display: 'block' }}>Referee Email:</span>
                                                    {student.referral_email ? (
                                                        <a 
                                                            href={`mailto:${student.referral_email}`}
                                                            style={{ fontSize: '0.9rem', fontWeight: 850, color: 'var(--lgl-cyan-dark)', textDecoration: 'none' }}
                                                        >
                                                            {student.referral_email}
                                                        </a>
                                                    ) : (
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 850, color: 'var(--index-text-heading)' }}>N/A</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms & Security Info */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.25rem' }}>
                                        <div style={{ background: 'var(--index-hover-bg)', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--index-border-subtle)' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block' }}>Terms Policy</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 850, color: student.agree_terms ? 'var(--lgl-success)' : 'var(--index-text-secondary)' }}>
                                                {student.agree_terms ? '✓ Agreed' : 'Standard'}
                                            </span>
                                        </div>
                                        <div style={{ background: 'var(--index-hover-bg)', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--index-border-subtle)' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--index-text-faint)', display: 'block' }}>Two-Factor (2FA)</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 850, color: student.two_factor_enabled ? 'var(--lgl-success)' : 'var(--index-text-secondary)' }}>
                                                {student.two_factor_enabled ? '✓ Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem' }}>
                                <div className="card-title-records">
                                    <h3><Activity size={20} color="var(--index-primary-color)" /> History Log</h3>
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
                        <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
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
                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--index-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--index-hover-bg)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Evaluation Intelligence Analysis</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--index-text-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {viewingQuizResult.title} • Score: <span style={{ color: viewingQuizResult.pivot.score >= (viewingQuizResult.quiz_data?.pass_mark || 80) ? 'var(--lgl-success)' : 'var(--lgl-error)' }}>{viewingQuizResult.pivot.score}%</span>
                                </p>
                            </div>
                            <button onClick={() => setViewingQuizResult(null)} style={{ background: 'var(--index-card-bg)', border: '1.5px solid var(--index-border-color)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                            {viewingQuizResult.quiz_data?.questions?.map((q: any, idx: number) => {
                                const studentAnswer = viewingQuizResult.pivot.answers[idx];
                                const isCorrect = studentAnswer === q.correct_answer;
                                
                                return (
                                    <div key={idx} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '20px', border: `1.5px solid ${isCorrect ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-danger-bg-soft)'}`, background: isCorrect ? 'var(--index-hover-bg)' : 'var(--index-danger-bg-soft)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--index-text-faint)' }}>Question {idx + 1}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isCorrect ? 'var(--lgl-success)' : 'var(--lgl-error)', background: isCorrect ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-danger-bg-soft)', padding: '4px 10px', borderRadius: '8px' }}>
                                                {isCorrect ? 'VALIDATED' : 'ERRONEOUS'}
                                            </span>
                                        </div>
                                        <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 850, color: 'var(--index-text-heading)', lineHeight: 1.4 }}>{q.question}</h4>
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
                                                            background: isRightAnswer ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : isStudentPick ? 'var(--index-danger-bg-soft)' : 'var(--index-card-bg)',
                                                            border: `1.2px solid ${isRightAnswer ? 'color-mix(in srgb, var(--lgl-success) 25%, transparent)' : isStudentPick ? 'color-mix(in srgb, var(--lgl-error) 25%, transparent)' : 'var(--index-hover-bg)'}`,
                                                            color: isRightAnswer ? 'var(--lgl-success)' : isStudentPick ? 'var(--lgl-error)' : 'var(--index-text-secondary)',
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
                        
                        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--index-border-subtle)', background: 'var(--index-hover-bg)', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                            <button onClick={() => setViewingQuizResult(null)} className="btn-confirm" style={{ background: 'var(--index-text-heading)' }}>Close Analysis</button>
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
                                    background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)',
                                    color: 'var(--index-primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1.5px solid color-mix(in srgb, var(--lgl-success) 15%, transparent)'
                                }}>
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>
                                        Assign Academic Cohort
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                                        Enroll {student.name} in standard learning programs
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowAssignCohortModal(false);
                                    setSelectedCohortIds([]);
                                }} 
                                style={{ background: 'var(--index-hover-bg)', border: '1.5px solid var(--index-border-color)', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {loadingCohorts ? (
                            <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                                <p style={{ marginTop: '1rem', fontWeight: 800, color: 'var(--index-text-secondary)', fontSize: '0.85rem' }}>Loading active cohorts...</p>
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
                                                        background: isSelected ? 'color-mix(in srgb, var(--lgl-success) 12%, transparent)' : 'var(--index-card-bg)',
                                                        border: `1.5px solid ${isSelected ? 'var(--lgl-success)' : 'var(--index-hover-bg)'}`,
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
                                                        border: `2px solid ${isSelected ? 'var(--lgl-success)' : 'var(--index-text-faint)'}`,
                                                        background: isSelected ? 'var(--lgl-success)' : 'var(--index-card-bg)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 850, color: 'var(--index-text-heading)', fontSize: '0.9rem' }}>{cohort.name}</div>
                                                        <div style={{ color: 'var(--index-text-secondary)', fontSize: '0.8rem', fontWeight: 650 }}>
                                                            {cohort.course?.title || 'General Curriculum'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--index-hover-bg)', borderRadius: '20px', border: '1.5px dashed var(--index-border-color)' }}>
                                            <Info size={24} color="var(--index-text-faint)" style={{ marginBottom: '0.5rem' }} />
                                            <p style={{ color: 'var(--index-text-secondary)', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>No other cohorts available</p>
                                            <p style={{ color: 'var(--index-text-faint)', fontWeight: 600, fontSize: '0.75rem', marginTop: '4px' }}>This student is already enrolled in all eligible cohorts.</p>
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
                                            background: selectedCohortIds.length === 0 ? 'var(--index-text-faint)' : 'var(--lgl-success)', 
                                            color: 'white', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            height: '44px', 
                                            margin: 0, 
                                            fontSize: '0.85rem', 
                                            fontWeight: 850, 
                                            boxShadow: selectedCohortIds.length === 0 ? 'none' : '0 4px 12px color-mix(in srgb, var(--lgl-success) 20%, transparent)',
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
            {showIssueCertModal && selectedCohortForCert && (
                <div className="modal-overlay">
                    <div className="modal-box animate-scale-up" style={{ maxWidth: '550px', borderRadius: '24px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 950, color: 'var(--index-text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isReassign ? <RotateCcw size={22} color="var(--lgl-warning)" /> : <Award size={22} color="var(--index-primary-color)" />}
                                {isReassign ? 'Reassign Certificate' : 'Issue Verified Certificate'}
                            </h3>
                            <button
                                onClick={() => setShowIssueCertModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--index-text-secondary)', display: 'flex', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: isReassign ? '1rem' : '2rem' }}>
                            {isReassign
                                ? <>Regenerate the certificate for <strong>{student.name}</strong>. The old certificate will be permanently replaced and a new email will be sent to the student.</>  
                                : <>Generate a manually verified course certificate for <strong>{student.name}</strong>. This will render a verified certificate background, assign a short verification code, and make it available for the student.</>}
                        </p>

                        {isReassign && (
                            <div style={{ background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)', border: '1.5px solid color-mix(in srgb, var(--lgl-warning) 35%, transparent)', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <RotateCcw size={16} color="var(--lgl-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--lgl-warning)', lineHeight: 1.5 }}>
                                    The existing certificate image will be deleted from the CDN and replaced. The verification UUID is preserved so old links remain valid.
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                    Recipient Full Name
                                </label>
                                <input
                                    type="text"
                                    value={certForm.fullName}
                                    onChange={(e) => setCertForm({ ...certForm, fullName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        height: '46px',
                                        background: 'var(--index-hover-bg)',
                                        border: '1.5px solid var(--index-border-color)',
                                        borderRadius: '12px',
                                        padding: '0 1rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    value={certForm.courseTitle}
                                    onChange={(e) => setCertForm({ ...certForm, courseTitle: e.target.value })}
                                    style={{
                                        width: '100%',
                                        height: '46px',
                                        background: 'var(--index-hover-bg)',
                                        border: '1.5px solid var(--index-border-color)',
                                        borderRadius: '12px',
                                        padding: '0 1rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                        Issue Date
                                    </label>
                                    <input
                                        type="date"
                                        value={certForm.issuedAt}
                                        onChange={(e) => setCertForm({ ...certForm, issuedAt: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '46px',
                                            background: 'var(--index-hover-bg)',
                                            border: '1.5px solid var(--index-border-color)',
                                            borderRadius: '12px',
                                            padding: '0 1rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                        Issued By
                                    </label>
                                    <input
                                        type="text"
                                        value={certForm.issuedBy}
                                        onChange={(e) => setCertForm({ ...certForm, issuedBy: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '46px',
                                            background: 'var(--index-hover-bg)',
                                            border: '1.5px solid var(--index-border-color)',
                                            borderRadius: '12px',
                                            padding: '0 1rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                className="btn-cancel"
                                onClick={() => setShowIssueCertModal(false)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', margin: 0 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm"
                                disabled={issuingCert || !certForm.fullName.trim() || !certForm.courseTitle.trim()}
                                onClick={handleIssueCertificate}
                                style={{
                                    background: isReassign ? 'var(--lgl-warning)' : 'var(--index-primary-color)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '44px',
                                    margin: 0,
                                    boxShadow: isReassign ? '0 4px 12px color-mix(in srgb, var(--lgl-warning) 20%, transparent)' : '0 4px 12px color-mix(in srgb, var(--index-primary-color) calc(0.2 * 100%), transparent)'
                                }}
                            >
                                {issuingCert ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} style={{ marginRight: '6px' }} />
                                        <span>{isReassign ? 'Reassigning...' : 'Generating...'}</span>
                                    </>
                                ) : (
                                    <span>{isReassign ? 'Reassign Certificate' : 'Issue Certificate'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
