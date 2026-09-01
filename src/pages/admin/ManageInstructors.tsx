import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Loader2, AlertCircle, Trash2, Mail, Lock, User as UserIcon, X, UserCog, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Instructor {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function ManageInstructors() {
    const [searchParams] = useSearchParams();
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const authHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/instructors`, { headers: authHeaders });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load instructors.');
            setInstructors(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'A network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const filteredInstructors = instructors.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/admin/instructors`, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create instructor.');

            toast.success('Instructor account created.');
            setShowModal(false);
            setForm({ name: '', email: '', password: '' });
            fetchInstructors();
        } catch (err: any) {
            toast.error(err.message || 'A network error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (instructor: Instructor) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Remove ${instructor.name}?`,
            text: 'This permanently deletes the instructor account. Their cohorts will remain but become unassigned.',
            showCancelButton: true,
            confirmButtonText: 'Remove Instructor',
            confirmButtonColor: 'var(--lgl-error)',
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_URL}/admin/instructors/${instructor.id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!response.ok) throw new Error('Failed to remove instructor.');
            setInstructors(instructors.filter((i) => i.id !== instructor.id));
            toast.success('Instructor removed.');
        } catch (err: any) {
            toast.error(err.message || 'A network error occurred.');
        }
    };

    return (
        <div className="manage-instructors-container">
            <style>{`
                .staff-scope .users-card {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .staff-scope .users-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }
                .staff-scope .users-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--index-text-heading);
                    margin: 0;
                }
                .staff-scope .btn-add-user {
                    background-color: var(--lgl-error);
                    color: white;
                    padding: 0.65rem 1.25rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .staff-scope .users-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                .staff-scope .users-table th {
                    text-align: left;
                    padding: 1rem;
                    color: var(--index-text-secondary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-bottom: 1px solid var(--index-hover-bg);
                }
                .staff-scope .users-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid var(--index-hover-bg);
                    vertical-align: middle;
                }
                .staff-scope .name-cell { display: flex; align-items: center; gap: 0.75rem; }
                .staff-scope .avatar-circle {
                    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: 900; font-size: 0.8rem;
                    background: linear-gradient(135deg, var(--lgl-error), color-mix(in srgb, var(--lgl-error) 45%, transparent));
                }
                .staff-scope .modal-overlay {
                    position: fixed; inset: 0;
                    background: color-mix(in srgb, var(--lgl-charcoal) 60%, transparent);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .staff-scope .modal-content {
                    background: white; width: 100%; max-width: 480px;
                    border-radius: 28px; padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                }
                .staff-scope .modal-header-premium { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
                .staff-scope .icon-box-premium {
                    background: var(--index-danger-bg-soft); padding: 12px; border-radius: 14px;
                    color: var(--lgl-error); display: flex; align-items: center; justify-content: center;
                }
                .staff-scope .form-group { margin-bottom: 1.5rem; }
                .staff-scope .form-group label {
                    display: block; font-weight: 700; color: var(--index-text-heading);
                    margin-bottom: 0.5rem; font-size: 0.9rem;
                }
                .staff-scope .premium-input-wrapper { position: relative; }
                .staff-scope .premium-input-icon {
                    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                    color: var(--index-text-faint);
                }
                .staff-scope .form-input {
                    width: 100%; padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: var(--index-card-bg); border: 1.5px solid var(--index-hover-bg);
                    border-radius: 16px; font-size: 0.95rem; font-weight: 600;
                    color: var(--index-text-heading); box-sizing: border-box;
                }
                .staff-scope .form-input:focus {
                    outline: none; border-color: var(--lgl-error); background: white;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--lgl-error) 5%, transparent);
                }
                .staff-scope .modal-submit-btn {
                    width: 100%; padding: 1rem; background: var(--lgl-error); color: white;
                    border: none; border-radius: 16px; font-weight: 800; font-size: 1rem;
                    cursor: pointer; margin-top: 0.5rem;
                }
                .staff-scope .modal-close-btn {
                    position: absolute; top: 1.5rem; right: 1.5rem; background: transparent;
                    border: none; cursor: pointer; color: var(--index-text-secondary);
                }
                .staff-scope .search-box-wrapper {
                    flex: 1; min-width: 220px; height: 46px; background: white;
                    border: 1.5px solid var(--index-border-color); border-radius: 12px;
                    display: flex; align-items: center; padding: 0 1rem; gap: 10px; margin-bottom: 1.5rem;
                }
                .staff-scope .search-input {
                    border: none !important; background: transparent !important; outline: none !important;
                    width: 100% !important; font-weight: 600 !important; font-size: 0.9rem !important;
                    color: var(--index-text-heading) !important;
                }
            `}</style>

            <div className="users-card">
                <div className="users-header">
                    <h2>Instructors ({filteredInstructors.length})</h2>
                    <button className="btn-add-user" onClick={() => setShowModal(true)}>Add Instructor <Plus size={18} /></button>
                </div>

                <div className="search-box-wrapper">
                    <Search size={18} color="var(--index-text-faint)" />
                    <input
                        className="search-input"
                        placeholder="Search instructors by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--lgl-error)" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>Loading instructors...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '3rem', background: 'var(--index-danger-bg-soft)', borderRadius: '24px', textAlign: 'center' }}>
                        <AlertCircle size={40} color="var(--lgl-error)" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>{error}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Instructor</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInstructors.length > 0 ? filteredInstructors.map((instructor) => (
                                    <tr key={instructor.id}>
                                        <td>
                                            <div className="name-cell">
                                                <div className="avatar-circle">{instructor.name.charAt(0).toUpperCase()}</div>
                                                <span style={{ fontWeight: 700, color: 'var(--index-text-heading)' }}>{instructor.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--index-text-secondary)', fontWeight: 500 }}>{instructor.email}</td>
                                        <td style={{ color: 'var(--index-text-secondary)', fontWeight: 500 }}>{new Date(instructor.created_at).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDelete(instructor)}
                                                title="Remove Instructor"
                                                style={{ background: 'var(--index-danger-bg-soft)', border: '1px solid var(--index-danger-bg-soft)', color: 'var(--lgl-error)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '5rem', color: 'var(--index-text-secondary)', fontWeight: 800 }}>
                                            No instructors yet. Add the first one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        <div className="modal-header-premium">
                            <div className="icon-box-premium"><UserCog size={22} /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>Add Instructor</h3>
                                <p style={{ margin: 0, color: 'var(--index-text-secondary)', fontSize: '0.9rem' }}>Create a new instructor account</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="premium-input-wrapper">
                                    <UserIcon size={18} className="premium-input-icon" />
                                    <input
                                        className="form-input"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="premium-input-wrapper">
                                    <Mail size={18} className="premium-input-icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="jane@layosgroupllc.com"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <div className="premium-input-wrapper">
                                    <Lock size={18} className="premium-input-icon" />
                                    <input
                                        type="password"
                                        className="form-input"
                                        required
                                        minLength={8}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Minimum 8 characters"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="modal-submit-btn" disabled={saving}>
                                {saving ? 'Creating...' : 'Create Instructor Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
