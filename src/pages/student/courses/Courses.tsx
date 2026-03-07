import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, BookOpen, ArrowLeft, Layers, Loader2, Upload, FileText, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Courses = () => {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [availableCohorts, setAvailableCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCohort, setSelectedCohort] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch Enrollments
                const enrollmentsRes = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const enrollmentsData = await enrollmentsRes.json();

                if (enrollmentsRes.ok) {
                    const mappedEnrolled = enrollmentsData.cohorts.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        price: `$${c.pricing}`,
                        paymentModel: c.payment_model,
                        paymentStatus: c.pivot.payment_status,
                        paymentLink: c.payment_link,
                        isEnrolled: true,
                        courses: c.course ? [{
                            id: c.course.id,
                            title: c.course.title,
                            instructor: c.instructor?.name || 'Assigned Instructor',
                            thumbnail: c.course.thumbnail || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            progress: c.pivot.progress || 0,
                            totalLessons: c.course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
                            completedLessons: 0,
                        }] : []
                    }));
                    setCohorts(mappedEnrolled);
                }

                // Fetch All Available Cohorts
                const cohortsRes = await fetch(`${API_URL}/cohorts`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const allCohorts = await cohortsRes.json();

                if (cohortsRes.ok) {
                    const enrolledIds = enrollmentsData.cohorts?.map((c: any) => c.id) || [];
                    const mappedAvailable = allCohorts
                        .filter((c: any) => !enrolledIds.includes(c.id))
                        .map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            price: `$${c.pricing}`,
                            paymentModel: c.payment_model,
                            paymentStatus: 'unpaid',
                            paymentLink: c.payment_link,
                            isEnrolled: false,
                            courses: c.course ? [{
                                id: c.course.id,
                                title: c.course.title,
                                instructor: c.instructor?.name || 'Assigned Instructor',
                                thumbnail: c.course.thumbnail || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                                progress: 0,
                                totalLessons: c.course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
                                completedLessons: 0,
                            }] : []
                        }));
                    setAvailableCohorts(mappedAvailable);
                }

            } catch (err) {
                console.error("Fetch Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Accessing Student Records...</p>
            </div>
        );
    }

    if (!selectedCohort) {
        return (
            <div className="animate-fade-in-up">
                <style>{`
                    .cohort-selection-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 2rem;
                        margin-top: 2rem;
                    }

                    .cohort-select-card {
                        background: white;
                        border: 1.5px solid #f1f5f9;
                        border-radius: 24px;
                        padding: 2rem;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .cohort-select-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                        border-color: #1a4d3e40;
                    }

                    .cohort-icon-box {
                        width: 56px;
                        height: 56px;
                        background: #f0fdf4;
                        color: #1a4d3e;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .cohort-select-card h3 {
                        font-size: 1.25rem;
                        font-weight: 800;
                        color: #0f172a;
                        margin: 0;
                        line-height: 1.4;
                    }

                    .cohort-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: #64748b;
                        font-size: 0.9rem;
                        font-weight: 600;
                    }

                    .tab-btn {
                        padding: 0.75rem 1.5rem;
                        font-size: 0.9rem;
                        font-weight: 800;
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.2s;
                        border: 1.5px solid transparent;
                    }

                    .tab-btn.active {
                        background: #1a4d3e;
                        color: white;
                    }

                    .tab-btn:not(.active) {
                        background: #f1f5f9;
                        color: #64748b;
                    }

                    .tab-btn:not(.active):hover {
                        background: #e2e8f0;
                        color: #0f172a;
                    }
                `}</style>

                <div className="section-header-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>
                            {activeTab === 'enrolled' ? 'My Curriculum' : 'Discovery Hub'}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
                            {activeTab === 'enrolled' ? 'Select a cohort to access your active courses.' : 'Explore and join new available programs.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '18px', border: '1.5px solid #f1f5f9' }}>
                        <button
                            className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
                            onClick={() => setActiveTab('enrolled')}
                        >
                            My Cohorts
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                            onClick={() => setActiveTab('available')}
                        >
                            Available
                        </button>
                    </div>
                </div>

                <div className="cohort-selection-grid">
                    {(activeTab === 'enrolled' ? cohorts : availableCohorts).length > 0 ? (
                        (activeTab === 'enrolled' ? cohorts : availableCohorts).map(cohort => (
                            <div key={cohort.id} className="cohort-select-card shadow-sm" onClick={() => setSelectedCohort(cohort)}>
                                {/* Rest of card content stays same */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="cohort-icon-box">
                                        <Users size={28} />
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        background: cohort.paymentStatus === 'unpaid' ? '#fef2f2' : (cohort.paymentStatus === 'partial' || cohort.paymentStatus === 'pending_verification') ? '#fff7ed' : '#f0fdf4',
                                        color: cohort.paymentStatus === 'unpaid' ? '#991b1b' : (cohort.paymentStatus === 'partial' || cohort.paymentStatus === 'pending_verification') ? '#9a3412' : '#166534',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {cohort.paymentStatus === 'unpaid' ? 'Purchase Required' : (cohort.paymentStatus === 'partial' || cohort.paymentStatus === 'pending_verification') ? 'Active (Restricted)' : 'Full Access'}
                                    </div>
                                </div>
                                <div>
                                    <div className="cohort-meta">
                                        <span style={{ color: '#1a4d3e', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>ID: {cohort.id}</span>
                                    </div>
                                    <h3>{cohort.name}</h3>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <BookOpen size={16} /> {cohort.courses.length} Courses
                                    </div>
                                    <div style={{ color: '#1a4d3e', fontWeight: 800, fontSize: '0.9rem' }}>
                                        {cohort.paymentStatus === 'unpaid' ? 'Pay to Join' : 'View Access'} <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                <Layers size={48} style={{ opacity: 0.5 }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                                {activeTab === 'enrolled' ? 'No Enrolled Programs' : 'No Programs Available'}
                            </h3>
                            <p style={{ color: '#64748b', fontWeight: 600 }}>
                                {activeTab === 'enrolled' ? 'You are not active in any cohorts yet.' : 'Check back later for new academic offerings.'}
                            </p>
                            {activeTab === 'enrolled' && (
                                <button
                                    onClick={() => setActiveTab('available')}
                                    style={{ marginTop: '2rem', height: '48px', padding: '0 2rem', background: '#1a4d3e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}
                                >
                                    Browse Available Cohorts
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <button
                onClick={() => setSelectedCohort(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    padding: '0'
                }}
            >
                <ArrowLeft size={18} /> Back to Cohorts
            </button>

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1a4d3e', marginBottom: '0.5rem' }}>
                    <Layers size={20} strokeWidth={2.5} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedCohort.id}</span>
                </div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{selectedCohort.name}</h1>
            </div>

            {selectedCohort.paymentStatus === 'unpaid' ? (
                <div style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '32px', padding: '5rem 3rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem auto' }}>
                        <Layers size={40} color="#1a4d3e" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.04em' }}>Activate Your Enrollment</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                        To access the modules in the <strong>{selectedCohort.name}</strong> cohort, please complete your {selectedCohort.paymentModel === 'split-50' ? 'initial deposit' : 'enrollment payment'}.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            onClick={() => window.open(selectedCohort.paymentLink, '_blank')}
                            style={{
                                height: '64px',
                                padding: '0 3rem',
                                background: '#1a4d3e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '1.1rem',
                                fontWeight: 950,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                boxShadow: '0 10px 15px -3px rgba(26, 77, 62, 0.2)'
                            }}
                        >
                            {selectedCohort.paymentModel === 'split-50' ? 'Pay 50% Deposit' : 'Pay Full Enrollment'} ({selectedCohort.paymentModel === 'split-50' ? `$${parseFloat(selectedCohort.price.replace('$', '').replace(',', '')) / 2}` : selectedCohort.price}) <ChevronRight size={20} />
                        </button>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>Payment grants access to all courses in this cohort.</p>

                        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '500px', padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '1.5px dashed #e2e8f0' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Upload Proof of Payment</h4>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>Please upload your transaction receipt (PDF, JPG, or PNG) for verification.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        id="receipt-upload"
                                        style={{ display: 'none' }}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    <label
                                        htmlFor="receipt-upload"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            padding: '1rem',
                                            background: 'white',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '14px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            color: selectedFile ? '#1a4d3e' : '#64748b',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {selectedFile ? <FileText size={18} /> : <Upload size={18} />}
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                            {selectedFile ? selectedFile.name : 'Choose Receipt File'}
                                        </span>
                                    </label>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!selectedFile) {
                                            toast.error("Please select a file first");
                                            return;
                                        }
                                        setUploading(true);
                                        const formData = new FormData();
                                        formData.append('receipt', selectedFile);

                                        try {
                                            const res = await fetch(`${API_URL}/cohorts/${selectedCohort.id}/upload-receipt`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Accept': 'application/json'
                                                },
                                                body: formData
                                            });
                                            if (res.ok) {
                                                toast.success("Receipt uploaded successfully!");
                                                const updatedCohort = { ...selectedCohort, paymentStatus: 'pending_verification', isEnrolled: true };

                                                // 1. Update active view
                                                setSelectedCohort(updatedCohort);

                                                // 2. Update Enrollments List (Add if new, update if exists)
                                                setCohorts(prev => {
                                                    const exists = prev.some(c => c.id == selectedCohort.id);
                                                    if (exists) {
                                                        return prev.map(c => c.id == selectedCohort.id ? updatedCohort : c);
                                                    }
                                                    return [updatedCohort, ...prev];
                                                });

                                                // 3. Remove from Available List if it was there
                                                setAvailableCohorts(prev => prev.filter(c => c.id != selectedCohort.id));

                                                // 4. Force switch to enrolled tab for future view
                                                setActiveTab('enrolled');

                                                setSelectedFile(null);
                                            } else {
                                                const data = await res.json();
                                                toast.error(data.message || "Failed to upload receipt");
                                            }
                                        } catch (err) {
                                            console.error("Upload Catch:", err);
                                            toast.error("An error occurred during upload");
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                    disabled={!selectedFile || uploading}
                                    style={{
                                        height: '52px',
                                        background: selectedFile ? '#1a4d3e' : '#e2e8f0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '14px',
                                        fontWeight: 800,
                                        cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    {uploading ? 'Uploading...' : 'Submit Proof'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : selectedCohort.paymentStatus === 'pending_verification' ? (
                <div style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '32px', padding: '5rem 3rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#fff7ed', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem auto' }}>
                        <Clock size={40} color="#9a3412" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.04em' }}>Verification in Progress</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                        Thank you for submitting your proof of payment for <strong>{selectedCohort.name}</strong>. An instructor is currently reviewing your receipt.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#fff7ed', color: '#9a3412', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
                        <Loader2 className="animate-spin" size={16} /> Status: Pending Verification
                    </div>
                    <p style={{ marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Standard verification usually takes 2-24 hours. You'll receive full access once approved.</p>
                </div>
            ) : (
                <div className="course-grid">
                    {selectedCohort.courses.map((course: any) => (
                        <div key={course.id} className="course-card shadow-premium">
                            <div className="course-image-wrapper">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="course-image"
                                    onContextMenu={(e: any) => e.preventDefault()}
                                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                                />
                                <div className="course-overlay shadow-sm" style={{
                                    background: course.progress === 100 ? '#f0fdf4' : '#eff6ff',
                                    color: course.progress === 100 ? '#166534' : '#1e40af',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    padding: '6px 14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Ready to Start'}
                                </div>
                            </div>

                            <div className="course-content">
                                <div className="course-instructor">Instructor: {course.instructor}</div>
                                <h3 className="course-title">{course.title}</h3>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        <span>{course.progress}% Complete</span>
                                        <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                    </div>
                                    <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '3px' }}>
                                        <div
                                            style={{ width: `${course.progress}%`, background: '#1a4d3e', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }}
                                        ></div>
                                    </div>
                                </div>

                                <Link
                                    to={`/student/courses/${course.id}?cohortId=${selectedCohort.id}`}
                                    className="instructor-link-modern"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#0f172a',
                                        color: 'white',
                                        marginTop: 'auto'
                                    }}
                                >
                                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                    <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;
