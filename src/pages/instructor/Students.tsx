import {
    Search,
    Plus,
    ExternalLink,
    Loader2,
    AlertCircle,
    Trash2,
    Edit,
    Filter
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Students() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCohort, setSelectedCohort] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        setCurrentPage(1);
    }, [users.length, searchTerm, selectedCohort, selectedStatus]);

    const filteredUsers = users.filter((user) => {
        // Search filter
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

        // Cohort filter
        const matchesCohort = 
            selectedCohort === 'all' || 
            (user.cohorts && user.cohorts.some((c: any) => String(c.id) === String(selectedCohort)));

        // Status filter
        let matchesStatus = true;
        if (selectedStatus === 'pending') {
            matchesStatus = user.payment_status === 'pending' && !!user.payment_method;
        } else if (selectedStatus === 'active') {
            matchesStatus = !(user.payment_status === 'pending' && !!user.payment_method);
        }

        return matchesSearch && matchesCohort && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

            if (response.status === 401) {
                logout();
                navigate('/instructor-login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                throw new Error(data.message || 'Failed to sync with central student records.');
            }
        } catch (err: any) {
            console.error("Fetch Students Error:", err);
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                toast.error('Connection failed. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/instructor-login');
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCohorts(data);
            }
        } catch (err) {
            console.error("Fetch Cohorts Error:", err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCohorts();
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

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast.error('No student records to export.');
            return;
        }

        const headers = ['ID', 'Name', 'Email', 'Phone', 'Enrollment Date', 'Cohorts', 'Payment Status'];
        const csvRows = filteredUsers.map(user => {
            const id = user.id;
            const name = `"${user.name.replace(/"/g, '""')}"`;
            const email = `"${user.email.replace(/"/g, '""')}"`;
            const phone = user.phone ? `"${user.phone.replace(/"/g, '""')}"` : '""';
            const enrollmentDate = new Date(user.created_at).toLocaleDateString();
            const cohortsList = `"${(user.cohorts || []).map((c: any) => c.name || c.id).join(', ').replace(/"/g, '""')}"`;
            const status = user.payment_status === 'pending' && user.payment_method ? 'Pending Approval' : 'Active';

            return [id, name, email, phone, enrollmentDate, cohortsList, status].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Student list exported successfully!');
    };

    return (
        <div className="all-users-container">
            <style>{`
                .staff-scope .all-users-container {
                    width: 100%;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .staff-scope .users-card {
                    background: white;
                    border: 1px solid #e2e8f0;
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
                }

                @media (max-width: 640px) {
                    .staff-scope .users-header {
                        flex-direction: column;
                        align-items: flex-start;
                        margin-bottom: 2rem;
                    }
                    .staff-scope .header-actions {
                        flex-direction: column;
                        width: 100%;
                        gap: 1rem;
                    }
                   .staff-scope  .btn-add-user,.staff-scope  .btn-export {
                        width: 100%;
                        justify-content: center;
                        height: 48px;
                    }
                    .staff-scope .search-pill-icon {
                        display: none;
                    }
                }

                .staff-scope .users-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .staff-scope .header-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .staff-scope .btn-export {
                    background-color: #020617; /* Dark navy */
                    color: white;
                    padding: 0.65rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                }

                .staff-scope .btn-add-user {
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

                .staff-scope .search-filter-belt {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    width: 100%;
                }

                .staff-scope .search-box-wrapper {
                    flex: 1;
                    min-width: 250px;
                    height: 48px;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    padding: 0 1rem;
                    gap: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }

                .staff-scope .search-box-wrapper:focus-within {
                    border-color: #020617;
                    box-shadow: 0 0 0 4px rgba(2, 6, 23, 0.05);
                }

                .staff-scope .search-input {
                    border: none !important;
                    background: transparent !important;
                    outline: none !important;
                    width: 100% !important;
                    font-weight: 600 !important;
                    font-size: 0.9rem !important;
                    color: #0f172a !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    box-shadow: none !important;
                }

                .staff-scope .search-input:focus {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }

                .staff-scope .filter-dropdown-wrapper {
                    height: 48px;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    padding: 0 1rem;
                    gap: 8px;
                    font-weight: 600;
                    color: #475569;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }

                .staff-scope .filter-dropdown-wrapper:focus-within {
                    border-color: #020617;
                    box-shadow: 0 0 0 4px rgba(2, 6, 23, 0.05);
                }

                .staff-scope .filter-label {
                    font-size: 0.9rem;
                    color: #64748b;
                }

                 .staff-scope .filter-select {
                    border: none !important;
                    background: transparent !important;
                    outline: none !important;
                    font-weight: 700 !important;
                    color: #1e293b !important;
                    font-size: 0.9rem !important;
                    cursor: pointer;
                    margin: 0 !important;
                    padding: 0 0.5rem 0 0 !important;
                    box-shadow: none !important;
                }

                .staff-scope .filter-select:focus {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                @media (max-width: 640px) {
                    .staff-scope .search-filter-belt {
                        flex-direction: column;
                        gap: 0.75rem;
                        width: 100%;
                    }
                    .staff-scope .search-box-wrapper,
                    .staff-scope .filter-dropdown-wrapper {
                        width: 100%;
                    }
                }

                .staff-scope .pagination-btn:hover:not(:disabled) {
                    background-color: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                    color: #020617 !important;
                }

                .staff-scope .users-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .staff-scope .users-table th {
                    text-align: left;
                    padding: 1rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-bottom: 1px solid #f1f5f9;
                }

                .staff-scope .users-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .staff-scope .user-id {
                    color: #1e293b;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .staff-scope .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }

                .staff-scope .name-cell:hover {
                    opacity: 0.7;
                }

                .staff-scope .avatar-circle {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    flex-shrink: 0;
                }

                .staff-scope .user-name {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .staff-scope .email-cell {
                    display: flex;
                    flex-direction: column;
                }

                .staff-scope .email-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .staff-scope .phone-text {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .staff-scope .date-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .staff-scope .users-card {
                        padding: 1rem;
                    }
                    .users-table thead {
                        display: none;
                    }
                   .staff-scope  .users-table,.staff-scope  .users-table tbody,.staff-scope  .users-table tr,.staff-scope  .users-table td {
                        display: block;
                        width: 100%;
                    }
                    .staff-scope .users-table tr {
                        background: white;
                        border: 1px solid #f1f5f9;
                        border-radius: 12px;
                        margin-bottom: 1rem;
                        padding: 1rem;
                    }
                    .staff-scope .users-table td {
                        border: none;
                        padding: 0.5rem 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .staff-scope .users-table td::before {
                        content: attr(data-label);
                        font-weight: 700;
                        color: #64748b;
                        font-size: 0.8rem;
                        text-transform: uppercase;
                    }
                   .staff-scope  .users-table td:last-child {
                        border-top: 1px solid #f8fafc;
                        margin-top: 0.5rem;
                        padding-top: 1rem;
                    }
                    .staff-scope .name-cell {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }


                .staff-scope .verification-badge {
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

                .staff-scope .verification-badge:hover {
                    background-color: #e2e8f0;
                }

                .staff-scope .verified {
                    color: #1e293b;
                }

                .staff-scope .non-verified {
                    color: #94a3b8;
                }

                .staff-scope .verification-icon {
                    color: #475569;
                }

                /* Modal Styles */
                .staff-scope .modal-overlay {
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

                .staff-scope .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 550px;
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                }

                .staff-scope .modal-header-premium {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                }

                .staff-scope .icon-box-premium {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 14px;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .staff-scope .form-group {
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

                .staff-scope .premium-input-wrapper {
                    position: relative;
                }

                .staff-scope .premium-input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .staff-scope .form-input {
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

                .staff-scope .cohort-item-premium {
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
                    <h2>Students ({filteredUsers.length})</h2>
                    <div className="header-actions">
                        <button className="btn-export" onClick={handleExport}>Export List</button>
                        <button className="btn-add-user" onClick={() => navigate('/instructor/students/add')}>Register New Student <Plus size={18} /></button>
                    </div>
                </div>

                <div className="search-filter-belt">
                    <div className="search-box-wrapper">
                        <Search size={20} color="#94a3b8" />
                        <input
                            className="search-input"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-dropdown-wrapper">
                        <span className="filter-label">Cohort:</span>
                        <select
                            value={selectedCohort}
                            onChange={(e) => setSelectedCohort(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Cohorts</option>
                            {cohorts.map((cohort: any) => (
                                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-dropdown-wrapper">
                        <span className="filter-label">Status:</span>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Approval</option>
                            <option value="active">Active / Approved</option>
                        </select>
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
                    <>
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
                                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="user-id" data-label="ID">{user.id}</td>
                                        <td data-label="Student Name">
                                            <div className="name-cell" onClick={() => navigate(`/instructor/students/${user.id}`)}>
                                                <div className="avatar-circle" style={{ background: user.avatar || 'linear-gradient(135deg, #3b82f6, #93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="user-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    {user.name} <ExternalLink size={14} style={{ color: '#94a3b8' }} />
                                                    {user.payment_status === 'pending' && user.payment_method && (
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 950,
                                                            background: '#fffbeb',
                                                            color: '#d97706',
                                                            border: '1px solid #fde68a',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.025em',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            boxShadow: '0 2px 4px rgba(217, 119, 6, 0.05)'
                                                        }}>
                                                            Pending Approval
                                                        </span>
                                                    )}
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

                    {/* Pagination Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                            Showing <span style={{ fontWeight: 800, color: '#0f172a' }}>{filteredUsers.length > 0 ? startIndex + 1 : 0}</span> to <span style={{ fontWeight: 800, color: '#0f172a' }}>{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of <span style={{ fontWeight: 800, color: '#0f172a' }}>{filteredUsers.length}</span> students
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                                style={{
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e2e8f0',
                                    background: 'white',
                                    color: currentPage === 1 ? '#cbd5e1' : '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                const isClose = Math.abs(pageNum - currentPage) <= 1;
                                const isEnd = pageNum === 1 || pageNum === totalPages;
                                if (!isClose && !isEnd) {
                                    if (pageNum === 2 || pageNum === totalPages - 1) {
                                        return <span key={pageNum} style={{ padding: '0 0.5rem', color: '#94a3b8' }}>...</span>;
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={{
                                            padding: '0.5rem 0.85rem',
                                            borderRadius: '8px',
                                            border: '1.5px solid',
                                            borderColor: currentPage === pageNum ? '#020617' : '#e2e8f0',
                                            background: currentPage === pageNum ? '#020617' : 'white',
                                            color: currentPage === pageNum ? 'white' : '#475569',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="pagination-btn"
                                style={{
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e2e8f0',
                                    background: 'white',
                                    color: (currentPage === totalPages || totalPages === 0) ? '#cbd5e1' : '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>)}
            </div>
        </div>
    );
}
