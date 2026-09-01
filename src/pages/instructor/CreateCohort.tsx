import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

interface InstructorOption {
    id: number;
    name: string;
    email: string;
}

export default function CreateCohort() {
    const navigate = useNavigate();
    const { user, userRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        timezone: 'UTC+1 (WAT)',
        visibility: 'public'
    });
    const [instructors, setInstructors] = useState<InstructorOption[]>([]);
    const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');

    useEffect(() => {
        if (userRole !== 'admin') return;
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        fetch(`${API_URL}/admin/instructors`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setInstructors(data);
                    if (data.length > 0) setSelectedInstructorId(String(data[0].id));
                }
            })
            .catch(() => setInstructors([]));
    }, [userRole]);

    const basePath = '/instructor/cohorts';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (userRole === 'admin' && !selectedInstructorId) {
            setError('Please select an instructor to assign this cohort to.');
            return;
        }

        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        // Generate a clean ID for the cohort
        const cohortId = `CH-${formData.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: cohortId,
                    name: formData.name,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    enrollment_deadline: formData.enrollmentDeadline,
                    timezone: formData.timezone,
                    visibility: formData.visibility,
                    instructor_id: userRole === 'admin' ? Number(selectedInstructorId) : user?.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create cohort.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Cohort Created!',
                text: 'Cohort settings have been created successfully.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                navigate(`${basePath}/${data.id}`);
            });
        } catch (err: any) {
            console.error('Cohort Creation Error:', err);
            const errorMsg = err.message || 'A network error occurred.';
            setError(errorMsg);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMsg,
                confirmButtonColor: 'var(--index-primary-color)'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-cohort-container animate-fade-in">
            <style>{`
                .staff-scope .create-cohort-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }

                @media (max-width: 768px) {
                    .staff-scope .create-cohort-container {
                        padding: 1.5rem 1rem;
                    }
                }

                .staff-scope .breadcrumb-back {
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

                .breadcrumb-back:hover { color: var(--index-primary-color); }

                .staff-scope .form-header-premium {
                    margin-bottom: 3rem;
                }

                .form-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
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

                .staff-scope .cohort-form-card {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                @media (max-width: 768px) {
                    .staff-scope .cohort-form-card {
                        padding: 1.5rem;
                        border-radius: 24px;
                    }
                }

                .staff-scope .input-group-premium {
                    margin-bottom: 2rem;
                }

                .input-group-premium label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

                .staff-scope .input-premium {
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

                .input-premium:focus {
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

                @media (max-width: 640px) {
                    .staff-scope .form-grid-2 {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                .staff-scope .select-premium {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.25rem;
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

               .staff-scope  .submit-btn-premium:hover {
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

            <Link to={basePath} className="breadcrumb-back">
                <ArrowLeft size={18} /> Back to Cohorts
            </Link>

            <div className="form-header-premium" style={{ marginBottom: '2.5rem' }}>
                <h1>Create Cohort</h1>
                <p style={{ color: 'var(--index-text-secondary)', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    Configure a new session for student enrollment.
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
                    <span>Basic Configuration</span>
                </div>

                <div className="input-group-premium">
                    <label>Cohort Title</label>
                    <input
                        type="text"
                        className="input-premium"
                        placeholder="e.g. Masterclass Batch Jan 2026"
                        required
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div className="input-group-premium">
                        <label>End Date</label>
                        <input
                            type="date"
                            className="input-premium"
                            required
                            value={formData.endDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                    />
                </div>

                {userRole === 'admin' && (
                    <div className="input-group-premium">
                        <label>Assign Instructor</label>
                        <select
                            className="input-premium select-premium"
                            required
                            value={selectedInstructorId}
                            onChange={(e) => setSelectedInstructorId(e.target.value)}
                        >
                            {instructors.length === 0 && <option value="">No instructors available</option>}
                            {instructors.map((inst) => (
                                <option key={inst.id} value={inst.id}>{inst.name} &mdash; {inst.email}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button type="submit" className="submit-btn-premium" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Processing...
                        </>
                    ) : (
                        <>
                            Finalize Cohort <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
