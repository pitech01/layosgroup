import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Shield,
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
                    visibility: formData.visibility,
                    instructor_id: user?.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update cohort.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Cohort Updated!',
                text: 'Cohort settings have been updated successfully.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                navigate(`/instructor/cohorts/${id}`);
            });
        } catch (err: any) {
            console.error('Cohort Update Error:', err);
            const errorMsg = err.message || 'A network error occurred.';
            setError(errorMsg);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMsg,
                confirmButtonColor: 'var(--index-primary-color)'
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" />
                <p style={{ fontWeight: 800, color: 'var(--index-text-secondary)', fontSize: '1.1rem' }}>Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="create-cohort-container animate-fade-in">
            <style>{`
             .staff-scope    .create-cohort-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }

             .staff-scope    .breadcrumb-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--index-text-secondary);
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    transition: color 0.2s;
                }

            .staff-scope .breadcrumb-back:hover { color: var(--index-primary-color); }

            .staff-scope     .form-header-premium {
                    margin-bottom: 3rem;
                }

                .staff-scope .form-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                    letter-spacing: -0.04em;
                    margin: 0 0 0.5rem 0;
                }

             .staff-scope    .cohort-form-card {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

             .staff-scope    .input-group-premium {
                    margin-bottom: 2rem;
                }

              .staff-scope   .input-group-premium label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

              .staff-scope   .input-premium {
                    width: 100%;
                    height: 56px;
                    background: var(--index-hover-bg);
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 16px;
                    padding: 0 1.25rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--index-text-heading);
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

              .staff-scope   .input-premium:focus {
                    background: white;
                    border-color: var(--index-primary-color);
                    outline: none;
                    box-shadow: 0 0 0 5px color-mix(in srgb, var(--index-primary-color) 5%, transparent);
                }

                .staff-scope .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .staff-scope .submit-btn-premium {
                    width: 100%;
                    height: 64px;
                    background: var(--index-primary-color);
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
                    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--index-primary-color) 20%, transparent);
                    transition: all 0.3s;
                }

                .staff-scope .submit-btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px color-mix(in srgb, var(--index-primary-color) 25%, transparent);
                }

                .staff-scope .section-tile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                    margin-top: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--index-hover-bg);
                }

                .staff-scope .section-tile span {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                }
            `}</style>

            <Link to={`/instructor/cohorts/${id}`} className="breadcrumb-back">
                <ArrowLeft size={18} /> Back to Cohort Details
            </Link>

            <div className="form-header-premium" style={{ marginBottom: '2.5rem' }}>
                <h1>Cohort Settings</h1>
                <p style={{ color: 'var(--index-text-secondary)', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    Adjust configuration for <strong>{formData.name}</strong>
                </p>
            </div>

            {error && (
                <div className="animate-slide-in" style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    maxWidth: '420px',
                    width: 'calc(100% - 4rem)',
                    zIndex: 9999,
                    padding: '1rem 1.25rem',
                    background: 'var(--index-danger-bg-soft)',
                    border: '1px solid var(--index-danger-bg-soft)',
                    color: 'var(--lgl-error)',
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px color-mix(in srgb, var(--lgl-error) 15%, transparent)'
                }}>
                    <AlertCircle size={20} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--lgl-error)', cursor: 'pointer', display: 'flex', padding: '4px', flexShrink: 0 }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <form className="cohort-form-card shadow-premium" onSubmit={handleSubmit}>
                <div className="section-tile">
                    <Shield size={20} color="var(--index-primary-color)" />
                    <span>Cohort Configuration</span>
                </div>

                <div className="input-group-premium">
                    <label>Title</label>
                    <input
                        type="text"
                        className="input-premium"
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
                    <label>Registration Deadline</label>
                    <input
                        type="date"
                        className="input-premium"
                        required
                        value={formData.enrollmentDeadline}
                        onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                    />
                </div>



                <button type="submit" className="submit-btn-premium" disabled={updating}>
                    {updating ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Updating...
                        </>
                    ) : (
                        <>
                            Save Changes <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
