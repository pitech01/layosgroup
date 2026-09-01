import { useState, useEffect } from 'react';
import {
    UserPlus,
    ArrowLeft,
    Mail,
    Layers,
    ShieldCheck,
    CheckCircle,
    Info,
    AlertCircle,
    Phone,
    GraduationCap,
    BookOpen,
    CreditCard,
    DollarSign,
    Clock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AddStudent() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cohortIdFromUrl = searchParams.get('cohortId');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        course_name: 'Foundation Academy',
        education_level: "Bachelor's Degree",
        payment_plan: 'full', // 'full' (100%) or 'installment' (50%)
        payment_method: 'manual',
        cohorts: cohortIdFromUrl ? [cohortIdFromUrl] : [] as string[],
        sendWelcomeEmail: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohorts(data);
                if (cohortIdFromUrl && data.length > 0) {
                    const matched = data.find((c: any) => String(c.id) === String(cohortIdFromUrl));
                    if (matched && matched.course?.title) {
                        setFormData(prev => ({ ...prev, course_name: matched.course.title }));
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load academic sessions.');
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const toggleCohort = (id: string) => {
        setFormData(prev => {
            const isSelected = prev.cohorts.includes(id);
            const selected = isSelected
                ? prev.cohorts.filter(c => c !== id)
                : [...prev.cohorts, id];

            // If selecting a cohort and course_name matches default or is empty, adopt the cohort course
            let nextCourseName = prev.course_name;
            if (!isSelected) {
                const found = cohorts.find(c => String(c.id) === String(id));
                if (found && found.course?.title) {
                    nextCourseName = found.course.title;
                }
            }

            return { ...prev, cohorts: selected, course_name: nextCourseName };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const isInstallment = formData.payment_plan === 'installment';

            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    course_name: formData.course_name,
                    education_level: formData.education_level,
                    payment_plan: formData.payment_plan,
                    payment_method: formData.payment_method,
                    payment_status: 'approved',
                    payment_tracking_enabled: isInstallment,
                    cohorts: formData.cohorts,
                    password: formData.password || undefined,
                    send_welcome_email: formData.sendWelcomeEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/instructor/students');
                }, 1800);
            } else {
                throw new Error(data.message || 'Enrollment rejected by central registry.');
            }
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="add-student-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease-out' }}>
                    <div style={{ width: '100px', height: '100px', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: 'var(--index-primary-color)' }}>
                        <CheckCircle size={50} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--index-text-heading)', margin: '0 0 1rem 0' }}>Student Enrolled</h2>
                    <p style={{ color: 'var(--index-text-secondary)', fontSize: '1.2rem', fontWeight: 600 }}>The student profile has been created and verified successfully. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-student-container">
            <style>{`
                .staff-scope .add-student-container {
                    max-width: 1050px;
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
                    margin-bottom: 2.5rem;
                    transition: color 0.3s;
                }

                .staff-scope .back-link:hover {
                    color: var(--index-text-heading);
                }

                .staff-scope .registration-layout {
                    display: grid;
                    grid-template-columns: 1.25fr 0.75fr;
                    gap: 2.5rem;
                }

                .staff-scope .form-card-premium {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 32px;
                    padding: 2.75rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1.75rem;
                }

                .staff-scope .icon-box {
                    background: var(--index-hover-bg);
                    padding: 10px;
                    border-radius: 12px;
                    color: var(--index-text-heading);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .staff-scope .section-title h2 {
                    margin: 0;
                    font-size: 1.35rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                }

                .staff-scope .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .staff-scope .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .staff-scope .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .staff-scope .form-group label {
                    font-weight: 850;
                    color: var(--index-text-heading);
                    font-size: 0.88rem;
                    letter-spacing: -0.01em;
                }

                .staff-scope .input-wrapper {
                    position: relative;
                }

                .staff-scope .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--index-text-faint);
                }

                .staff-scope .premium-input,
                .staff-scope .premium-select {
                    width: 100%;
                    padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 0.92rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    color: var(--index-text-heading);
                }

                .staff-scope .premium-input:focus,
                .staff-scope .premium-select:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    background: white;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--index-primary-color) calc(0.05 * 100%), transparent);
                }

                .staff-scope .plan-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .staff-scope .plan-card {
                    padding: 1.25rem;
                    border-radius: 18px;
                    border: 2px solid var(--index-hover-bg);
                    background: var(--index-card-bg);
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .staff-scope .plan-card:hover {
                    border-color: color-mix(in srgb, var(--index-primary-color) 40%, transparent);
                    background: var(--index-hover-bg);
                }

                .staff-scope .plan-card.selected {
                    border-color: var(--index-primary-color);
                    background: color-mix(in srgb, var(--index-primary-color) 8%, transparent);
                }

                .staff-scope .plan-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .staff-scope .plan-title {
                    font-weight: 900;
                    font-size: 0.95rem;
                    color: var(--index-text-heading);
                }

                .staff-scope .plan-desc {
                    font-size: 0.78rem;
                    color: var(--index-text-secondary);
                    font-weight: 600;
                    line-height: 1.4;
                }

                .staff-scope .cohort-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                }

                .staff-scope .cohort-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .staff-scope .cohort-item:hover {
                    border-color: var(--index-primary-color);
                    background: var(--index-hover-bg);
                }

                .staff-scope .cohort-item.selected {
                    background: color-mix(in srgb, var(--lgl-success) 12%, transparent);
                    border-color: var(--index-primary-color);
                }

                .staff-scope .cohort-checkbox {
                    width: 20px;
                    height: 20px;
                    accent-color: var(--index-primary-color);
                }

                .staff-scope .cohort-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-scope .cohort-name {
                    font-weight: 850;
                    color: var(--index-text-heading);
                    font-size: 0.9rem;
                }

                .staff-scope .cohort-course {
                    font-size: 0.75rem;
                    color: var(--index-text-secondary);
                    font-weight: 600;
                }

                .staff-scope .sidebar-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .staff-scope .info-card {
                    background: var(--index-hover-bg);
                    border-radius: 24px;
                    padding: 1.75rem;
                    border: 1px solid var(--index-hover-bg);
                }

                .info-card h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .staff-scope .info-item {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 1rem;
                }

                .staff-scope .info-item-text {
                    font-size: 0.85rem;
                    color: var(--index-text-secondary);
                    font-weight: 600;
                    line-height: 1.5;
                }

                .staff-scope .btn-submit {
                    background: var(--index-primary-color);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 18px;
                    font-weight: 950;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s;
                    width: 100%;
                    margin-top: 1rem;
                }

                .staff-scope .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--index-primary-color) calc(0.3 * 100%), transparent);
                }

                .staff-scope .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 850px) {
                    .staff-scope .registration-layout {
                        grid-template-columns: 1fr;
                    }
                    .staff-scope .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .staff-scope .plan-cards-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={18} /> Back to Students
            </button>

            {error && (
                <div style={{ padding: '1.25rem', background: 'var(--index-danger-bg-soft)', border: '1.5px solid var(--index-danger-bg-soft)', borderRadius: '18px', color: 'var(--lgl-error)', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="registration-layout">
                <div className="form-card-premium shadow-premium">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Basic Information */}
                        <div className="section-title">
                            <div className="icon-box"><UserPlus size={20} /></div>
                            <h2>Student Information</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Full Name *</label>
                                <div className="input-wrapper">
                                    <UserPlus className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="e.g. Jane Doe"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        className="premium-input"
                                        placeholder="student@example.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone className="input-icon" size={18} />
                                    <input
                                        type="tel"
                                        className="premium-input"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Temporary Password (Optional)</label>
                                <div className="input-wrapper">
                                    <ShieldCheck className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="Defaults to 'password123' if left blank"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Course Track & Academic Background */}
                        <div className="section-title" style={{ marginTop: '1.5rem' }}>
                            <div className="icon-box"><BookOpen size={20} /></div>
                            <h2>Academic Track & Education</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Course / Program Track *</label>
                                <div className="input-wrapper">
                                    <BookOpen className="input-icon" size={18} />
                                    <select
                                        className="premium-select"
                                        value={formData.course_name}
                                        onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                                    >
                                        <option value="Foundation Academy">Foundation Academy</option>
                                        <option value="Professional Masterclass">Professional Masterclass</option>
                                        <option value="All-in-One Dual Bundle">All-in-One Dual Bundle</option>
                                        <option value="Cybersecurity Analyst Track">Cybersecurity Analyst Track</option>
                                        <option value="Cloud Engineering Track">Cloud Engineering Track</option>
                                        <option value="Custom Program">Custom Program</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Education Level</label>
                                <div className="input-wrapper">
                                    <GraduationCap className="input-icon" size={18} />
                                    <select
                                        className="premium-select"
                                        value={formData.education_level}
                                        onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                                    >
                                        <option value="High School Diploma">High School Diploma / GED</option>
                                        <option value="Associate Degree">Associate Degree</option>
                                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                                        <option value="Master's Degree">Master's Degree</option>
                                        <option value="Doctorate">Doctorate / PhD</option>
                                        <option value="Professional Certification">Professional Certification</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Payment Plan & Reminder Configuration */}
                        <div className="section-title" style={{ marginTop: '1.5rem' }}>
                            <div className="icon-box"><DollarSign size={20} /></div>
                            <h2>Payment Plan & Tuition Tracking</h2>
                        </div>

                        <div className="plan-cards-grid">
                            <div
                                className={`plan-card ${formData.payment_plan === 'full' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, payment_plan: 'full' })}
                            >
                                <div className="plan-header">
                                    <span className="plan-title">100% Full Payment</span>
                                    <CreditCard size={18} color={formData.payment_plan === 'full' ? 'var(--index-primary-color)' : 'var(--index-text-faint)'} />
                                </div>
                                <p className="plan-desc">
                                    Fully paid upfront. No remaining tuition reminder countdown or access locks will be applied.
                                </p>
                            </div>

                            <div
                                className={`plan-card ${formData.payment_plan === 'installment' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, payment_plan: 'installment' })}
                            >
                                <div className="plan-header">
                                    <span className="plan-title" style={{ color: formData.payment_plan === 'installment' ? 'var(--lgl-warning)' : 'inherit' }}>
                                        50% Installment Payment
                                    </span>
                                    <Clock size={18} color={formData.payment_plan === 'installment' ? 'var(--lgl-warning)' : 'var(--index-text-faint)'} />
                                </div>
                                <p className="plan-desc">
                                    Part payment (50% down). <strong>Activates tuition deadline countdown reminder</strong> on student dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Payment Method</label>
                                <div className="input-wrapper">
                                    <CreditCard className="input-icon" size={18} />
                                    <select
                                        className="premium-select"
                                        value={formData.payment_method}
                                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <option value="manual">Manual / Instructor Verified (Direct Deposit / Offline)</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="square">Square</option>
                                        <option value="stripe">Stripe</option>
                                        <option value="bank_transfer">Bank Wire / Transfer</option>
                                        <option value="cash">Cash</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Cohort Assignment */}
                        <div className="section-title" style={{ marginTop: '1.5rem' }}>
                            <div className="icon-box"><Layers size={20} /></div>
                            <h2>Assign Cohort(s)</h2>
                        </div>

                        <div className="cohort-grid" style={{ marginBottom: '2rem' }}>
                            {cohorts.length > 0 ? (
                                cohorts.map(c => (
                                    <div
                                        key={c.id}
                                        className={`cohort-item ${formData.cohorts.includes(c.id) ? 'selected' : ''}`}
                                        onClick={() => toggleCohort(c.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            className="cohort-checkbox"
                                            checked={formData.cohorts.includes(c.id)}
                                            onChange={() => { }} // Handled by div onClick
                                        />
                                        <div className="cohort-info">
                                            <span className="cohort-name">{c.name}</span>
                                            <span className="cohort-course">{c.course?.title || 'No Course Attached'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem' }}>No cohorts available.</p>
                            )}
                        </div>

                        {/* Section 5: Email Notification */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--index-hover-bg)', padding: '1.25rem', borderRadius: '18px', marginBottom: '2.5rem' }}>
                            <input
                                type="checkbox"
                                id="welcomeEmail"
                                checked={formData.sendWelcomeEmail}
                                onChange={e => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--index-primary-color)' }}
                            />
                            <label htmlFor="welcomeEmail" style={{ fontSize: '0.9rem', color: 'var(--index-text-heading)', fontWeight: 750, cursor: 'pointer' }}>
                                Send welcome email with login credentials and access details.
                            </label>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enrolling Student...' : 'Create & Verify Student Profile'}
                        </button>
                    </form>
                </div>

                <div className="sidebar-info">
                    <div className="info-card shadow-premium">
                        <h4><ShieldCheck size={18} color="var(--index-primary-color)" /> Instant Verification</h4>
                        <div className="info-item">
                            <div className="info-item-text">
                                When added manually by an instructor, the student's status is automatically set to <strong>Approved</strong>. No pending manual review is required.
                            </div>
                        </div>
                    </div>

                    <div className="info-card shadow-premium">
                        <h4><Clock size={18} color="var(--lgl-warning)" /> 50% Reminder Automation</h4>
                        <div className="info-item">
                            <div className="info-item-text">
                                Selecting <strong>50% Installment</strong> flags the student's account with tuition tracking. The student dashboard will automatically show the remaining balance countdown and payment link.
                            </div>
                        </div>
                    </div>

                    <div className="info-card shadow-premium">
                        <h4><Info size={18} color="var(--index-text-heading)" /> Credentials & Access</h4>
                        <div className="info-item">
                            <CheckCircle size={16} color="var(--index-primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div className="info-item-text">The student can log in right away and access their assigned cohorts.</div>
                        </div>
                        <div className="info-item" style={{ marginBottom: 0 }}>
                            <CheckCircle size={16} color="var(--index-primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div className="info-item-text">You can resend login credentials at any time from their profile.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

