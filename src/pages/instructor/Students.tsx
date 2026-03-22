import {
    Search,
    Plus,
    ExternalLink,
    Loader2,
    AlertCircle,
    Trash2,
    Edit
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Students() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/students`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                throw new Error(data.message || 'Failed to sync with central student records.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDeleteStudent = async (id: number) => {
        if (!window.confirm('Are you sure you want to purge this student record? This action will remove all academic history for this user.')) return;

        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                alert('Conflict detected during purging. Please retry.');
            }
        } catch (err) {
            alert('Signal lost. Check your network connectivity.');
        }
    };

    return (
        <div className="all-users-container">
            <style>{`
                .all-users-container {
                    width: 100%;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .users-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .users-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1.5rem;
                }

                @media (max-width: 640px) {
                    .users-header {
                        flex-direction: column;
                        align-items: flex-start;
                        margin-bottom: 2rem;
                    }
                    .header-actions {
                        flex-direction: column;
                        width: 100%;
                        gap: 1rem;
                    }
                    .btn-add-user, .btn-export {
                        width: 100%;
                        justify-content: center;
                        height: 48px;
                    }
                    .search-pill-icon {
                        display: none;
                    }
                }

                .users-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .btn-export {
                    background-color: #020617; /* Dark navy */
                    color: white;
                    padding: 0.65rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                }

                .btn-add-user {
                    background-color: #020617;
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

                .filter-pill {
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                }

                .search-pill-icon {
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .users-table th {
                    text-align: left;
                    padding: 1rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-bottom: 1px solid #f1f5f9;
                }

                .users-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .user-id {
                    color: #1e293b;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }

                .name-cell:hover {
                    opacity: 0.7;
                }

                .avatar-circle {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    flex-shrink: 0;
                }

                .user-name {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .email-cell {
                    display: flex;
                    flex-direction: column;
                }

                .email-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .phone-text {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .date-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .users-card {
                        padding: 1rem;
                    }
                    .users-table thead {
                        display: none;
                    }
                    .users-table, .users-table tbody, .users-table tr, .users-table td {
                        display: block;
                        width: 100%;
                    }
                    .users-table tr {
                        background: white;
                        border: 1px solid #f1f5f9;
                        border-radius: 12px;
                        margin-bottom: 1rem;
                        padding: 1rem;
                    }
                    .users-table td {
                        border: none;
                        padding: 0.5rem 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .users-table td::before {
                        content: attr(data-label);
                        font-weight: 700;
                        color: #64748b;
                        font-size: 0.8rem;
                        text-transform: uppercase;
                    }
                    .users-table td:last-child {
                        border-top: 1px solid #f8fafc;
                        margin-top: 0.5rem;
                        padding-top: 1rem;
                    }
                    .name-cell {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }


                .verification-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.025em;
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 140px;
                    justify-content: center;
                }

                .verification-badge:hover {
                    background-color: #e2e8f0;
                }

                .verified {
                    color: #1e293b;
                }

                .non-verified {
                    color: #94a3b8;
                }

                .verification-icon {
                    color: #475569;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 550px;
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                }

                .modal-header-premium {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                }

                .icon-box-premium {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 14px;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    letter-spacing: -0.01em;
                }

                .premium-input-wrapper {
                    position: relative;
                }

                .premium-input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .form-input {
                    width: 100%;
                    padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #020617;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(2, 6, 23, 0.05);
                }

                .cohort-item-premium {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 0.75rem;
                }

                .cohort-item-premium:hover {
                    border-color: #020617;
                    background: #f8fafc;
                }

                .cohort-item-premium.selected {
                    background: #f8fafc;
                    border-color: #020617;
                }
            `}</style>

            <div className="users-card">
                <div className="users-header">
                    <h2>Students ({users.length})</h2>
                    <div className="header-actions">
                        <button className="btn-export">Export List</button>
                        <button className="btn-add-user" onClick={() => navigate('/instructor/students/add')}>Register New Student <Plus size={18} /></button>
                        <div className="search-pill-icon"><Search size={18} /></div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={48} color="#020617" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Fetching student list...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '3rem', background: '#fff1f2', borderRadius: '24px', border: '1.5px solid #ffe4e6', textAlign: 'center', marginBottom: '3rem' }}>
                        <AlertCircle size={40} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 900 }}>Connection Failed</h3>
                        <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 2rem' }}>{error}</p>
                        <button onClick={fetchStudents} className="btn-export" style={{ margin: '0 auto' }}>Try Reconnecting</button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>ID</th>
                                    <th>Student Name</th>
                                    <th>Email & Contact</th>
                                    <th>Enrollment Date</th>
                                    <th>Active Cohorts</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="user-id" data-label="ID">{user.id}</td>
                                        <td data-label="Student Name">
                                            <div className="name-cell" onClick={() => navigate(`/instructor/students/${user.id}`)}>
                                                <div className="avatar-circle" style={{ background: user.avatar || 'linear-gradient(135deg, #3b82f6, #93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="user-name">
                                                    {user.name} <ExternalLink size={14} style={{ color: '#94a3b8' }} />
                                                </span>
                                            </div>
                                        </td>
                                        <td data-label="Email & Contact">
                                            <div className="email-cell">
                                                <span className="email-text">{user.email}</span>
                                                {user.phone && <span className="phone-text">{user.phone}</span>}
                                            </div>
                                        </td>
                                        <td data-label="Enrollment Date">
                                            <span className="date-text">{new Date(user.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td data-label="Active Cohorts">
                                            {user.cohorts?.length > 0 ? (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start' }}>
                                                    {user.cohorts.map((c: any) => (
                                                        <span key={c.id} style={{ fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#1e293b' }}>{c.name || c.id}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>No active cohorts</span>
                                            )}
                                        </td>
                                        <td data-label="Management">
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => navigate(`/instructor/students/${user.id}/edit`)}
                                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Edit Student"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(user.id)}
                                                    style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Delete Student"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: '#64748b', fontWeight: 800 }}>
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
