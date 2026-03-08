import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Shield,
    DollarSign,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    X,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EditCohort() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        timezone: 'UTC+1 (WAT)',
        deliveryMode: 'recorded',
        seatLimit: 100,
        pricing: '',
        paymentModel: 'full',
        paymentLink: '',
        visibility: 'public'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCohort = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/cohorts/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        name: data.name || '',
                        startDate: data.start_date || '',
                        endDate: data.end_date || '',
                        enrollmentDeadline: data.enrollment_deadline || '',
                        timezone: data.timezone || 'UTC+1 (WAT)',
                        deliveryMode: data.delivery_mode || 'recorded',
                        seatLimit: data.seat_limit || 100,
                        pricing: data.pricing || '',
                        paymentModel: data.payment_model || 'full',
                        paymentLink: data.payment_link || '',
                        visibility: data.visibility || 'public'
                    });
                } else {
                    throw new Error(data.message || 'Failed to fetch cohort data.');
                }
            } catch (err: any) {
                console.error("Fetch Cohort Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCohort();
    }, [id, API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    enrollment_deadline: formData.enrollmentDeadline,
                    timezone: formData.timezone,
                    delivery_mode: formData.deliveryMode,
                    seat_limit: formData.seatLimit,
                    pricing: formData.pricing,
                    payment_model: formData.paymentModel,
                    payment_link: formData.paymentLink,
                    visibility: formData.visibility,
                    instructor_id: user?.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update cohort.');
            }

            console.log("Cohort Updated:", data);
            navigate(`/instructor/cohorts/${id}`);
        } catch (err: any) {
            console.error('Cohort Update Error:', err);
            setError(err.message || 'A network error occurred.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b', fontSize: '1.1rem' }}>Loading Cohort Settings...</p>
            </div>
        );
    }

    return (
        <div className="create-cohort-container animate-fade-in">
            <style>{`
                .create-cohort-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }

                @media (max-width: 768px) {
                    .create-cohort-container {
                        padding: 1.5rem 1rem;
                    }
                }

                .breadcrumb-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    transition: color 0.2s;
                }

                .breadcrumb-back:hover { color: #1a4d3e; }

                .form-header-premium {
                    margin-bottom: 3rem;
                }

                .form-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0 0 0.5rem 0;
                }

                @media (max-width: 768px) {
                    .form-header-premium h1 {
                        font-size: 1.75rem;
                    }
                    .form-header-premium p {
                        font-size: 0.95rem;
                    }
                }

                .cohort-form-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                @media (max-width: 768px) {
                    .cohort-form-card {
                        padding: 1.5rem;
                        border-radius: 24px;
                    }
                }

                .input-group-premium {
                    margin-bottom: 2rem;
                }

                .input-group-premium label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 900;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

                .input-premium {
                    width: 100%;
                    height: 56px;
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 0 1.25rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .input-premium:focus {
                    background: white;
                    border-color: #1a4d3e;
                    outline: none;
                    box-shadow: 0 0 0 5px rgba(26, 77, 62, 0.05);
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                @media (max-width: 640px) {
                    .form-grid-2 {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                .select-premium {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.25rem;
                }

                .submit-btn-premium {
                    width: 100%;
                    height: 64px;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 1.1rem;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                .submit-btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.25);
                }

                .section-tile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                    margin-top: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .section-tile span {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                }
            `}</style>

            <Link to={`/instructor/cohorts/${id}`} className="breadcrumb-back">
                <ArrowLeft size={18} /> Back to Cohort Details
            </Link>

            <div className="form-header-premium">
                <h1>Cohort Settings</h1>
                <p>Update configuration and pricing for {formData.name}</p>
            </div>

            {error && (
                <div className="animate-slide-in" style={{
                    padding: '1rem 1.25rem',
                    background: '#fff1f2',
                    border: '1px solid #ffe4e6',
                    color: '#e11d48',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)'
                }}>
                    <AlertCircle size={20} strokeWidth={2.5} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <form className="cohort-form-card shadow-premium" onSubmit={handleSubmit}>
                <div className="section-tile">
                    <Shield size={20} color="#1a4d3e" />
                    <span>Cohort Identity</span>
                </div>

                <div className="input-group-premium">
                    <label>Cohort Name</label>
                    <input
                        type="text"
                        className="input-premium"
                        placeholder="e.g. Masterclass Batch Jan 2026"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="form-grid-2">
                    <div className="input-group-premium">
                        <label>Start Date</label>
                        <input
                            type="date"
                            className="input-premium"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div className="input-group-premium">
                        <label>End Date</label>
                        <input
                            type="date"
                            className="input-premium"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="input-group-premium">
                    <label>Enrollment Deadline</label>
                    <input
                        type="date"
                        className="input-premium"
                        required
                        value={formData.enrollmentDeadline}
                        onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                    />
                </div>


                <div className="section-tile">
                    <DollarSign size={20} color="#1a4d3e" />
                    <span>Pricing & Payments</span>
                </div>

                <div className="form-grid-2">
                    <div className="input-group-premium">
                        <label>Course Price (USD)</label>
                        <input
                            type="text"
                            className="input-premium"
                            placeholder="e.g. 500.00"
                            required
                            value={formData.pricing}
                            onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                        />
                    </div>
                    <div className="input-group-premium">
                        <label>Payment Model</label>
                        <select
                            className="input-premium select-premium"
                            value={formData.paymentModel}
                            onChange={(e) => setFormData({ ...formData, paymentModel: e.target.value })}
                        >
                            <option value="full">Full Upfront</option>
                            <option value="split-50">50/50 Installment</option>
                        </select>
                    </div>
                </div>

                <div className="input-group-premium">
                    <label>External Payment Link (Stripe, Paystack, etc.)</label>
                    <input
                        type="url"
                        className="input-premium"
                        placeholder="https://..."
                        value={formData.paymentLink}
                        onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                    />
                </div>

                <button type="submit" className="submit-btn-premium" disabled={updating}>
                    {updating ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Saving Settings...
                        </>
                    ) : (
                        <>
                            Save Cohort Settings <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
