import { useState, useEffect } from 'react';
import {
    UserCircle,
    ArrowLeft,
    Mail,
    Phone,
    Layers,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Loader2,
    BookOpen,
    GraduationCap,
    DollarSign,
    CreditCard,
    MapPin,
    Tag,
    Clock,
    Share2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const COURSE_TRACKS = [
    { value: 'Cybersecurity Operations & Defense', label: 'Cybersecurity Operations & Defense' },
    { value: 'Data Science & Machine Learning', label: 'Data Science & Machine Learning' },
    { value: 'Full Stack Software Engineering', label: 'Full Stack Software Engineering' },
    { value: 'Cloud Architecture & DevOps', label: 'Cloud Architecture & DevOps' },
    { value: 'UI/UX Design & Product Strategy', label: 'UI/UX Design & Product Strategy' },
    { value: 'Other / Custom Program', label: 'Other / Custom Program' },
];

const EDUCATION_LEVELS = [
    { value: "High School Diploma / GED", label: "High School Diploma / GED" },
    { value: "Associate Degree", label: "Associate Degree" },
    { value: "Bachelor's Degree", label: "Bachelor's Degree" },
    { value: "Master's Degree", label: "Master's Degree" },
    { value: "Doctorate / PhD", label: "Doctorate / PhD" },
    { value: "Self-Taught / Bootcamp Graduate", label: "Self-Taught / Bootcamp Graduate" },
    { value: "Other", label: "Other" },
];

export default function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        course_name: 'Cybersecurity Operations & Defense',
        education_level: "Bachelor's Degree",
        payment_plan: 'full' as 'full' | 'installment',
        payment_status: 'approved',
        payment_method: 'manual',
        payment_tracking_enabled: false,
        coupon_code: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        hear_source: 'website',
        referral_name: '',
        referral_email: '',
        cohorts: [] as string[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch Cohorts
                const cohortsRes = await fetch(`${API_URL}/cohorts`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (cohortsRes.ok) {
                    const cohortsData = await cohortsRes.json();
                    setCohorts(cohortsData);
                }

                // Fetch Student Data
                const studentRes = await fetch(`${API_URL}/students/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!studentRes.ok) {
                    throw new Error('Failed to load student details.');
                }
                
                const studentData = await studentRes.json();
                
                const plan = (studentData.payment_plan === 'installment' || studentData.payment_plan === '50_percent' || studentData.payment_plan === '50%')
                    ? 'installment'
                    : 'full';

                setFormData({
                    name: studentData.name || '',
                    email: studentData.email || '',
                    phone: studentData.phone || '',
                    password: '',
                    course_name: studentData.course_name || (studentData.cohorts?.[0]?.course?.title) || 'Cybersecurity Operations & Defense',
                    education_level: studentData.education_level || "Bachelor's Degree",
                    payment_plan: plan,
                    payment_status: studentData.payment_status || 'approved',
                    payment_method: studentData.payment_method || 'manual',
                    payment_tracking_enabled: plan === 'installment',
                    coupon_code: studentData.coupon_code || '',
                    address_line1: studentData.address_line1 || '',
                    address_line2: studentData.address_line2 || '',
                    city: studentData.city || '',
                    state: studentData.state || '',
                    zip: studentData.zip || '',
                    country: studentData.country || '',
                    hear_source: studentData.hear_source || 'website',
                    referral_name: studentData.referral_name || '',
                    referral_email: studentData.referral_email || '',
                    cohorts: studentData.cohorts?.map((c: any) => c.id) || []
                });
            } catch (err: any) {
                setError(err.message || 'An error occurred while loading data.');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [id]);

    const handlePlanSelect = (plan: 'full' | 'installment') => {
        setFormData(prev => ({
            ...prev,
            payment_plan: plan,
            payment_tracking_enabled: plan === 'installment'
        }));
    };

    const toggleCohort = (cohortId: string) => {
        if (formData.payment_status === 'rejected') {
            setError("Cohort assignments are locked because this student's payment is currently rejected.");
            return;
        }
        setFormData(prev => {
            const selected = prev.cohorts.includes(cohortId)
                ? prev.cohorts.filter(c => c !== cohortId)
                : [...prev.cohorts, cohortId];
            return { ...prev, cohorts: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate(`/instructor/students/${id}`);
                }, 1500);
            } else {
                throw new Error(data.message || 'Failed to update student profile.');
            }
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>Loading student data...</p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="add-student-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease-out' }}>
                    <div style={{ width: '100px', height: '100px', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: 'var(--index-primary-color)' }}>
                        <CheckCircle size={50} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--index-text-heading)', margin: '0 0 1rem 0' }}>Profile Updated</h2>
                    <p style={{ color: 'var(--index-text-secondary)', fontSize: '1.2rem', fontWeight: 600 }}>The student record has been updated successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-student-container">
            <style>{`
                .staff-scope .add-student-container {
                    max-width: 960px;
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
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .back-link:hover {
                    color: var(--index-text-heading);
                }

                .staff-scope .form-card-premium {
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-border-color);
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1.5rem;
                }

                .staff-scope .icon-box {
                    background: var(--index-hover-bg);
                    padding: 10px;
                    border-radius: 12px;
                    color: var(--index-primary-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .section-title h2 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                }

                .staff-scope .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .staff-scope .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
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

                .staff-scope .premium-input {
                    width: 100%;
                    padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-border-color);
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    color: var(--index-text-heading);
                    box-sizing: border-box;
                }

                .premium-input:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    background: var(--index-card-bg);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--index-primary-color) calc(0.08 * 100%), transparent);
                }

                .staff-scope .premium-select {
                    width: 100%;
                    padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-border-color);
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    color: var(--index-text-heading);
                    cursor: pointer;
                    appearance: none;
                    box-sizing: border-box;
                }

                .premium-select:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--index-primary-color) calc(0.08 * 100%), transparent);
                }

                .staff-scope .plan-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .staff-scope .plan-card {
                    border: 2px solid var(--index-border-color);
                    border-radius: 20px;
                    padding: 1.5rem;
                    background: var(--index-card-bg);
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                .plan-card:hover {
                    border-color: var(--index-primary-color);
                    transform: translateY(-2px);
                }

                .plan-card.active {
                    border-color: var(--index-primary-color);
                    background: color-mix(in srgb, var(--index-primary-color) 4%, transparent);
                    box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--index-primary-color) 15%, transparent);
                }

                .plan-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }

                .plan-card-title {
                    font-size: 1.05rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .plan-card-desc {
                    font-size: 0.825rem;
                    color: var(--index-text-secondary);
                    line-height: 1.45;
                    font-weight: 550;
                }

                .staff-scope .cohort-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .staff-scope .cohort-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-border-color);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cohort-item:hover {
                    border-color: var(--index-primary-color);
                    background: var(--index-hover-bg);
                }

                .cohort-item.selected {
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

                .staff-scope .btn-submit {
                    background: var(--index-primary-color);
                    color: white;
                    border: none;
                    padding: 1.1rem 2rem;
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
                    margin-top: 2rem;
                }

                .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--index-primary-color) calc(0.3 * 100%), transparent);
                }

                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 768px) {
                    .staff-scope .plan-cards-grid,
                    .staff-scope .cohort-grid,
                    .staff-scope .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .staff-scope .form-card-premium {
                        padding: 1.5rem;
                    }
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <button onClick={() => navigate(`/instructor/students/${id}`)} className="back-link">
                <ArrowLeft size={18} /> Back to Student Details
            </button>

            {error && (
                <div style={{ padding: '1.25rem', background: 'var(--index-danger-bg-soft)', border: '1.5px solid var(--index-danger-bg-soft)', borderRadius: '18px', color: 'var(--lgl-error)', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="form-card-premium">
                <form onSubmit={handleSubmit}>
                    {/* SECTION 1: Personal & Account */}
                    <div className="section-title">
                        <div className="icon-box"><UserCircle size={22} /></div>
                        <h2>Personal & Account Identity</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Full Name *</label>
                            <div className="input-wrapper">
                                <UserCircle className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="e.g. John Doe"
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
                                    placeholder="e.g. +1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Update Password (Leave blank to keep unchanged)</label>
                            <div className="input-wrapper">
                                <ShieldCheck className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="premium-input"
                                    placeholder="Enter new password (optional)"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Academic Program & Background */}
                    <div className="section-title" style={{ marginTop: '2.5rem' }}>
                        <div className="icon-box"><BookOpen size={22} /></div>
                        <h2>Academic Track & Educational Background</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Course / Program Track</label>
                            <div className="input-wrapper">
                                <BookOpen className="input-icon" size={18} />
                                <select
                                    className="premium-select"
                                    value={formData.course_name}
                                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                                >
                                    {COURSE_TRACKS.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Highest Education Level</label>
                            <div className="input-wrapper">
                                <GraduationCap className="input-icon" size={18} />
                                <select
                                    className="premium-select"
                                    value={formData.education_level}
                                    onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                                >
                                    {EDUCATION_LEVELS.map(ed => (
                                        <option key={ed.value} value={ed.value}>{ed.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>How Did They Hear About Us?</label>
                            <div className="input-wrapper">
                                <Share2 className="input-icon" size={18} />
                                <select
                                    className="premium-select"
                                    value={formData.hear_source}
                                    onChange={e => setFormData({ ...formData, hear_source: e.target.value })}
                                >
                                    <option value="website">Direct Website Search</option>
                                    <option value="social">Social Media (Instagram, LinkedIn, X)</option>
                                    <option value="referral">Friend / Peer Referral</option>
                                    <option value="alumni">Layos Alumni Recommendation</option>
                                    <option value="instructor">Instructor Direct Invite</option>
                                    <option value="other">Other Channel</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Coupon / Discount Code (Optional)</label>
                            <div className="input-wrapper">
                                <Tag className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="e.g. SCHOLARSHIP50"
                                    value={formData.coupon_code}
                                    onChange={e => setFormData({ ...formData, coupon_code: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.hear_source === 'referral' && (
                            <>
                                <div className="form-group">
                                    <label>Referral Friend's Name</label>
                                    <div className="input-wrapper">
                                        <UserCircle className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="Referrer Full Name"
                                            value={formData.referral_name}
                                            onChange={e => setFormData({ ...formData, referral_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Referral Friend's Email</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="premium-input"
                                            placeholder="Referrer Email"
                                            value={formData.referral_email}
                                            onChange={e => setFormData({ ...formData, referral_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* SECTION 3: Tuition & Payment Configuration */}
                    <div className="section-title" style={{ marginTop: '2.5rem' }}>
                        <div className="icon-box"><CreditCard size={22} /></div>
                        <h2>Tuition Plan & Payment Reminder Setting</h2>
                    </div>

                    <div className="plan-cards-grid">
                        <div
                            className={`plan-card ${formData.payment_plan === 'full' ? 'active' : ''}`}
                            onClick={() => handlePlanSelect('full')}
                        >
                            <div className="plan-card-header">
                                <div className="plan-card-title">
                                    <CheckCircle size={18} color={formData.payment_plan === 'full' ? 'var(--index-primary-color)' : 'var(--index-text-faint)'} />
                                    100% Full Payment
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--lgl-success)', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)', padding: '3px 8px', borderRadius: '6px' }}>
                                    NO REMINDER
                                </span>
                            </div>
                            <p className="plan-card-desc">
                                Student has paid the complete tuition upfront. No countdown reminders or tuition payment banners will be displayed on their dashboard.
                            </p>
                        </div>

                        <div
                            className={`plan-card ${formData.payment_plan === 'installment' ? 'active' : ''}`}
                            onClick={() => handlePlanSelect('installment')}
                        >
                            <div className="plan-card-header">
                                <div className="plan-card-title">
                                    <Clock size={18} color={formData.payment_plan === 'installment' ? 'var(--index-primary-color)' : 'var(--index-text-faint)'} />
                                    50% Installment Payment
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--lgl-warning)', background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)', padding: '3px 8px', borderRadius: '6px' }}>
                                    REMINDER ACTIVE
                                </span>
                            </div>
                            <p className="plan-card-desc">
                                Student paid 50% deposit. The automatic tuition countdown reminder banner and balance payment checkout will be activated on their student dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Payment Status</label>
                            <div className="input-wrapper">
                                <ShieldCheck className="input-icon" size={18} />
                                <select
                                    className="premium-select"
                                    value={formData.payment_status}
                                    onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                                >
                                    <option value="approved">Approved / Verified (Full Access)</option>
                                    <option value="pending">Pending Verification</option>
                                    <option value="rejected">Rejected / Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Payment Method</label>
                            <div className="input-wrapper">
                                <DollarSign className="input-icon" size={18} />
                                <select
                                    className="premium-select"
                                    value={formData.payment_method}
                                    onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="manual">Manual / Instructor Direct Entry</option>
                                    <option value="zelle">Zelle Transfer</option>
                                    <option value="square">Square Online</option>
                                    <option value="stripe">Stripe Card Payment</option>
                                    <option value="bank_transfer">Direct Bank Wire</option>
                                    <option value="other">Other Method</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Residential Address Details */}
                    <div className="section-title" style={{ marginTop: '2.5rem' }}>
                        <div className="icon-box"><MapPin size={22} /></div>
                        <h2>Residential Address (Optional)</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Address Line 1</label>
                            <div className="input-wrapper">
                                <MapPin className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="Street Address"
                                    value={formData.address_line1}
                                    onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                className="premium-input"
                                style={{ paddingLeft: '1.25rem' }}
                                placeholder="City"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>State / Province</label>
                            <input
                                type="text"
                                className="premium-input"
                                style={{ paddingLeft: '1.25rem' }}
                                placeholder="State"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Postal / Zip Code</label>
                            <input
                                type="text"
                                className="premium-input"
                                style={{ paddingLeft: '1.25rem' }}
                                placeholder="Zip code"
                                value={formData.zip}
                                onChange={e => setFormData({ ...formData, zip: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                className="premium-input"
                                style={{ paddingLeft: '1.25rem' }}
                                placeholder="Country"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 5: Cohort Assignments */}
                    <div className="section-title" style={{ marginTop: '2.5rem' }}>
                        <div className="icon-box"><Layers size={22} /></div>
                        <h2>Cohort Enrollments</h2>
                    </div>

                    {formData.payment_status === 'rejected' && (
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)',
                            border: '1.5px solid color-mix(in srgb, var(--lgl-warning) 35%, transparent)',
                            borderRadius: '16px',
                            color: 'var(--lgl-warning)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <AlertCircle size={18} />
                            <span>Payment Declined: Cohort assignments are locked while payment status is rejected.</span>
                        </div>
                    )}
 
                    <div className="cohort-grid" style={{ marginBottom: '2.5rem' }}>
                        {cohorts.length > 0 ? (
                            cohorts.map(c => (
                                <div
                                    key={c.id}
                                    className={`cohort-item ${formData.cohorts.includes(c.id) ? 'selected' : ''}`}
                                    onClick={() => toggleCohort(c.id)}
                                    style={formData.payment_status === 'rejected' ? { opacity: 0.6, cursor: 'not-allowed', background: 'var(--index-hover-bg)' } : {}}
                                >
                                    <input
                                        type="checkbox"
                                        className="cohort-checkbox"
                                        checked={formData.cohorts.includes(c.id)}
                                        disabled={formData.payment_status === 'rejected'}
                                        readOnly
                                    />
                                    <div className="cohort-info">
                                        <span className="cohort-name">{c.name}</span>
                                        <span className="cohort-course">{c.course?.title || 'No Course Attached'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>No cohorts available.</p>
                        )}
                    </div>

                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving Profile Changes...
                            </>
                        ) : 'Save Modifications'}
                    </button>
                </form>
            </div>
        </div>
    );
}
