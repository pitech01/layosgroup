import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Clock, Download, Lock, Upload, ShieldCheck, AlertCircle, Loader2, Video, Calendar, Users, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const cohortId = searchParams.get('cohortId');

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCourseData = async () => {
        try {
            const token = localStorage.getItem('token');

            // 1. Try to get specific enrollment details first
            const enrollmentsRes = await fetch(`${API_URL}/my-enrollments`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const enrollmentsData = await enrollmentsRes.json();

            let enrolledCohort = null;
            if (enrollmentsRes.ok) {
                enrolledCohort = enrollmentsData.cohorts.find((c: any) => c.id == cohortId);
            }

            if (enrolledCohort) {
                setCourse({
                    id: enrolledCohort.course.id,
                    title: enrolledCohort.course.title,
                    instructor: enrolledCohort.instructor?.name || 'Assigned Instructor',
                    cohortName: enrolledCohort.name,
                    price: `$${enrolledCohort.pricing}`,
                    paymentModel: enrolledCohort.payment_model,
                    paymentLink: enrolledCohort.payment_link,
                    description: enrolledCohort.course.description,
                    category: enrolledCohort.course.category || 'video',
                    progress: enrolledCohort.pivot.progress || 0,
                    paymentStatus: enrolledCohort.pivot.payment_status,
                    modules: enrolledCohort.course.modules || [],
                    isEnrolled: true,
                    resources: [],
                    completedLessons: enrollmentsData.completed_lessons || []
                });
            } else {
                const cohortRes = await fetch(`${API_URL}/cohorts/${cohortId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const cohort = await cohortRes.json();

                if (cohortRes.ok && cohort.course) {
                    setCourse({
                        id: cohort.course.id,
                        title: cohort.course.title,
                        instructor: cohort.instructor?.name || 'Assigned Instructor',
                        cohortName: cohort.name,
                        price: `$${cohort.pricing}`,
                        paymentModel: cohort.payment_model,
                        paymentLink: cohort.payment_link,
                        description: cohort.course.description,
                        category: cohort.course.category || 'video',
                        progress: 0,
                        paymentStatus: 'unpaid',
                        modules: cohort.course.modules || [],
                        isEnrolled: false,
                        resources: []
                    });
                }
            }
        } catch (err) {
            console.error("Fetch Course Details Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId, cohortId]);

    const handleReceiptUpload = async () => {
        if (!receiptFile) {
            toast.error("Please select a file first.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('receipt', receiptFile);

        try {
            const response = await fetch(`${API_URL}/cohorts/${cohortId}/upload-receipt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                toast.success("Receipt uploaded successfully!");
                setUploadSuccess(true);
                setReceiptFile(null);
                setTimeout(() => fetchCourseData(), 2000);
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to upload receipt.');
                setUploadError(data.message || 'Failed to upload receipt.');
            }
        } catch (err) {
            console.error("Upload Receipt Error:", err);
            toast.error('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const response = await fetch(`${API_URL}/cohorts/${cohortId}/enroll`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || "Enrolled successfully!");
                fetchCourseData();
            } else {
                toast.error(data.message || 'Failed to enroll.');
            }
        } catch (err) {
            console.error("Enrollment Error:", err);
            toast.error('An error occurred during enrollment.');
        } finally {
            setEnrolling(false);
        }
    };

    const handleRetryPayment = () => {
        if (course?.paymentLink) {
            window.open(course.paymentLink, '_blank');
        }
    };

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Opening Learning Environment...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontWeight: 900, color: '#0f172a' }}>Course Access Error</h2>
                <p style={{ color: '#64748b', fontWeight: 600 }}>We couldn't verify your enrollment in this course.</p>
                <Link to="/student/courses" className="btn-primary-forest" style={{ display: 'inline-flex', marginTop: '2rem' }}>Back to Courses</Link>
            </div>
        );
    }

    const isLockedAt50 = course.progress >= 50 && course.paymentModel === 'split-50' && course.paymentStatus === 'partial';
    const isPublicPreview = !course.isEnrolled;

    return (
        <div className="animate-fade-in-up">
            <style>{`
                .lock-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(8px);
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                    border-radius: 20px;
                    border: 2px dashed #e2e8f0;
                }

                .module-card {
                    position: relative;
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2.5rem;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .module-card.locked { opacity: 0.8; }

                .status-badge-premium {
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-pending { background: #fff7ed; color: #9a3412; }
                .status-full { background: #f0fdf4; color: #166534; }
                .status-partial { background: #eff6ff; color: #1e40af; }
                .status-unpaid { background: #fef2f2; color: #991b1b; }
            `}</style>

            <div style={{ marginBottom: '3rem' }}>
                <Link to="/student/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 700, marginBottom: '2rem' }}>
                    <ChevronLeft size={18} /> Back to Courses
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1a4d3e', marginBottom: '0.75rem' }}>
                            <ShieldCheck size={20} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{course.cohortName}</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>{course.title}</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.75rem' }}>Instruction by <span style={{ color: '#0f172a' }}>{course.instructor}</span></p>
                    </div>

                    <div style={{ background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', minWidth: '240px' }} className="shadow-sm">
                        {isPublicPreview ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>Enrollment Status</div>
                                <span className="status-badge-premium status-unpaid" style={{ display: 'block' }}>Not Enrolled</span>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>Enrollment Progress</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px' }}>
                                        <div style={{ width: `${course.progress}%`, background: isLockedAt50 ? '#f59e0b' : '#1a4d3e', height: '100%', borderRadius: '5px' }}></div>
                                    </div>
                                    <span style={{ fontWeight: 900, color: '#0f172a' }}>{course.progress}%</span>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <span className={`status-badge-premium status-${course.paymentStatus}`}>
                                        {course.paymentStatus === 'full' ? 'Verified: Full Access' :
                                            course.paymentStatus === 'partial' ? 'Access: Phase 1 (50%)' :
                                                course.paymentStatus === 'pending_verification' ? 'Verification Pending' : 'Payment Required'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Curriculum</h3>
                        <p style={{ color: '#64748b', fontWeight: 600 }}>Master the requested competencies through these modules.</p>
                    </div>

                    {course.modules.map((module: any, idx: number) => {
                        const isLockedModule = isLockedAt50 && idx >= Math.ceil(course.modules.length / 2);

                        return (
                            <div key={module.id} className={`module-card shadow-sm ${isLockedModule || isPublicPreview ? 'locked' : ''}`}>
                                {(isLockedModule || isPublicPreview) && (
                                    <div className="lock-overlay">
                                        <div style={{ background: isPublicPreview ? '#f8fafc' : '#fffbeb', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                            <Lock size={32} color={isPublicPreview ? '#64748b' : '#f59e0b'} />
                                        </div>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                                            {isPublicPreview ? 'Enrollment Required' : 'Phase 2 Content Locked'}
                                        </h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, maxWidth: '250px', marginBottom: '1.5rem' }}>
                                            {isPublicPreview ? 'Join this cohort to access curriculum modules and learning resources.' : 'You\'ve completed Phase 1. Complete your balance payment to unlock remaining modules.'}
                                        </p>
                                        {isPublicPreview ? (
                                            <button onClick={handleEnroll} disabled={enrolling} className="btn-standard" style={{ background: '#1a4d3e', color: 'white' }}>
                                                {enrolling ? 'Enrolling...' : 'Join Program Now'}
                                            </button>
                                        ) : (
                                            <button onClick={handleRetryPayment} className="btn-standard" style={{ background: '#0f172a', color: 'white' }}>Unlock Phase 2 Content</button>
                                        )}
                                    </div>
                                )}

                                <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontWeight: 850 }}>Module {idx + 1}: {module.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{module.lessons?.length || 0} Lessons</span>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    {module.lessons?.map((lesson: any) => {
                                        const isCompleted = course.completedLessons?.some((cl: any) => cl.id === lesson.id);
                                        return (
                                            <div key={lesson.id} style={{ padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.2s' }}>
                                                <div style={{ color: isCompleted ? '#10b981' : '#94a3b8' }}>
                                                    {isCompleted ? <CheckCircle size={20} /> :
                                                        lesson.type === 'live' ? <Video size={20} /> :
                                                            lesson.type === 'material' ? <FileText size={20} /> :
                                                                <PlayCircle size={20} />
                                                    }
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{lesson.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                        {lesson.type === 'live' ? (
                                                            <>
                                                                <Calendar size={12} /> {lesson.live_date || 'TBA'}
                                                                <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
                                                                <Clock size={12} /> {lesson.live_time || 'TBA'}
                                                            </>
                                                        ) : lesson.type === 'material' ? (
                                                            <>
                                                                <FileText size={12} /> Document Resource
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock size={12} /> {lesson.duration || 'Video Lesson'}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {(!isLockedModule && !isPublicPreview) && (
                                                    <Link
                                                        to={`/student/courses/${courseId}/lesson/${lesson.id}?cohortId=${cohortId}`}
                                                        className="btn-standard"
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontSize: '0.8rem',
                                                            background: isCompleted ? '#f1f5f9' : '#1a4d3e',
                                                            color: isCompleted ? '#64748b' : 'white',
                                                            textDecoration: 'none',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {isCompleted ? 'Review' : 'Start'}
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div className="shadow-premium" style={{ background: '#020617', borderRadius: '32px', padding: '2.5rem', color: 'white' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Payment Dashboard</h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 600, marginBottom: '0.5rem' }}>Total Enrollment Cost</div>
                            <div style={{ fontSize: '2rem', fontWeight: 950 }}>{course.price}</div>
                        </div>

                        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ffffff20' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 600, marginBottom: '0.5rem' }}>Primary Content Type</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {course.category === 'video' && <><Video size={18} /> <span style={{ fontWeight: 800 }}>Video Lessons</span></>}
                                {course.category === 'live' && <><Users size={18} /> <span style={{ fontWeight: 800 }}>Live Sessions</span></>}
                                {course.category === 'material' && <><FileText size={18} /> <span style={{ fontWeight: 800 }}>Document Hub</span></>}
                                {course.category === 'quiz' && <><HelpCircle size={18} /> <span style={{ fontWeight: 800 }}>Assessments</span></>}
                            </div>
                        </div>

                        {isPublicPreview ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                                <div style={{ background: '#ffffff10', padding: '1.5rem', borderRadius: '20px', border: '1px solid #ffffff20' }}>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                                        Join this academic cohort to begin your learning journey. After enrolling, you can proceed to payment.
                                    </p>
                                </div>
                                <button onClick={handleEnroll} disabled={enrolling} className="btn-standard" style={{ width: '100%', background: 'white', color: '#1a4d3e', height: '56px', fontSize: '1rem', fontWeight: 900 }}>
                                    {enrolling ? 'Enrolling...' : 'Enroll in Program'}
                                </button>
                            </div>
                        ) : (
                            <>
                                {course.paymentStatus === 'unpaid' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <button onClick={handleRetryPayment} className="btn-standard" style={{ width: '100%', background: 'white', color: '#1a4d3e', height: '56px', fontSize: '1rem', fontWeight: 900 }}>
                                            Pay {course.paymentModel === 'split-50' ? '50% Initial Deposit' : 'Full Enrollment'}
                                        </button>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Or upload payment proof below</span>
                                        </div>
                                    </div>
                                )}

                                {course.paymentStatus === 'partial' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ background: '#ffffff10', padding: '1rem', borderRadius: '16px', border: '1px solid #ffffff20' }}>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Outstanding Balance</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{course.price} (Balance)</div>
                                        </div>
                                        <button onClick={handleRetryPayment} className="btn-standard" style={{ width: '100%', background: '#1a4d3e', color: 'white', height: '56px', fontSize: '1rem', fontWeight: 900 }}>
                                            Complete Payment (Final 50%)
                                        </button>
                                    </div>
                                )}

                                {course.paymentStatus === 'pending_verification' && (
                                    <div style={{ background: '#ffffff10', padding: '2rem', borderRadius: '20px', textAlign: 'center', border: '1px solid #ffffff20' }}>
                                        <AlertCircle size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Verification in Progress</h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0, lineHeight: 1.5 }}>Our team is reviewing your uploaded receipt. Access will be updated shortly.</p>
                                    </div>
                                )}

                                {course.paymentStatus === 'full' && (
                                    <div style={{ background: '#10b98120', padding: '2rem', borderRadius: '20px', textAlign: 'center', border: '1px solid #10b98140' }}>
                                        <ShieldCheck size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#10b981' }}>Enrollment Verified</h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7, color: 'white', margin: 0, lineHeight: 1.5 }}>You have full lifetime access to this course and all its modules.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isPublicPreview && (course.paymentStatus === 'unpaid' || course.paymentStatus === 'partial') && (
                        <div className="glass-panel" style={{ padding: '2.5rem', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontWeight: 950, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={20} color="#1a4d3e" /> Activate Your Enrollment
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                                    If you've made a payment via bank transfer or another manual method, upload your receipt below to activate your access.
                                </p>
                            </div>

                            {uploadSuccess ? (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                                    <CheckCircle size={32} color="#15803d" style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }} />
                                    <h5 style={{ color: '#166534', fontWeight: 900, margin: '0 0 0.25rem 0' }}>Upload Successful</h5>
                                    <p style={{ color: '#15803d', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Verification in progress. Your dashboard will update shortly.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <input
                                            type="file"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptFile(e.target.files?.[0] || null)}
                                            style={{ width: '100%', height: '100%', opacity: 0, position: 'absolute', cursor: 'pointer', zIndex: 1 }}
                                        />
                                        <div style={{ border: '2px dashed #cbd5e1', padding: '2rem 1.5rem', borderRadius: '16px', textAlign: 'center', color: receiptFile ? '#1a4d3e' : '#94a3b8', background: receiptFile ? '#f0fdf4' : 'transparent', transition: 'all 0.3s' }}>
                                            <FileText size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{receiptFile ? receiptFile.name : 'Click or Drag proof of payment'}</div>
                                            {!receiptFile && <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>Support for PDF, JPG, PNG (Max 5MB)</div>}
                                        </div>
                                    </div>

                                    {uploadError && (
                                        <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertCircle size={14} /> {uploadError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleReceiptUpload}
                                        disabled={uploading || !receiptFile}
                                        className="btn-primary-forest"
                                        style={{ width: '100%', height: '52px', justifyContent: 'center', fontSize: '0.95rem' }}
                                    >
                                        <Upload size={18} /> {uploading ? 'Processing Activation...' : 'Request Enrollment Activation'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <div style={{ background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '24px', padding: '2rem' }}>
                        <h4 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>Reference Materials</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <FileText size={20} color="#64748b" />
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Course Syllabus.pdf</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>2.1 MB</div>
                                    </div>
                                </div>
                                <button className="btn-standard" style={{ padding: '0.5rem' }}><Download size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
