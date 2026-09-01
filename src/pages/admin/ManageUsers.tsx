import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ShieldCheck, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PAGE_ACCESS_REGISTRY } from '../../constants/pageAccess';

interface AppUser {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
}

export default function ManageUsers() {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor'>('all');

    const [activeUser, setActiveUser] = useState<AppUser | null>(null);
    const [disabledPages, setDisabledPages] = useState<string[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const authHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users`, { headers: authHeaders });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load users.');
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'A network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const openPermissions = async (user: AppUser) => {
        setActiveUser(user);
        setPermissionsLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${user.id}/permissions`, { headers: authHeaders });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load permissions.');
            setDisabledPages(data.disabled_pages || []);
        } catch (err: any) {
            toast.error(err.message || 'A network error occurred.');
            setActiveUser(null);
        } finally {
            setPermissionsLoading(false);
        }
    };

    const togglePage = (pageKey: string) => {
        setDisabledPages((prev) => prev.includes(pageKey) ? prev.filter((k) => k !== pageKey) : [...prev, pageKey]);
    };

    const savePermissions = async () => {
        if (!activeUser) return;
        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${activeUser.id}/permissions`, {
                method: 'PUT',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ disabled_pages: disabledPages }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save permissions.');
            toast.success(`Permissions updated for ${activeUser.name}.`);
            setActiveUser(null);
        } catch (err: any) {
            toast.error(err.message || 'A network error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const relevantPages = activeUser?.role === 'instructor'
        ? PAGE_ACCESS_REGISTRY.filter((p) => p.group === 'instructor')
        : [];

    return (
        <div className="manage-users-container">
            <style>{`
                .staff-scope .users-card {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .staff-scope .users-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
                }
                .staff-scope .users-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--index-text-heading); margin: 0; }
                .staff-scope .search-filter-belt { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
                .staff-scope .search-box-wrapper {
                    flex: 1; min-width: 220px; height: 46px; background: white;
                    border: 1.5px solid var(--index-border-color); border-radius: 12px;
                    display: flex; align-items: center; padding: 0 1rem; gap: 10px;
                }
                .staff-scope .search-input {
                    border: none !important; background: transparent !important; outline: none !important;
                    width: 100% !important; font-weight: 600 !important; font-size: 0.9rem !important;
                    color: var(--index-text-heading) !important;
                }
                .staff-scope .filter-dropdown-wrapper {
                    height: 46px; background: white; border: 1.5px solid var(--index-border-color);
                    border-radius: 12px; display: flex; align-items: center; padding: 0 1rem; gap: 8px;
                }
                .staff-scope .filter-select {
                    border: none !important; background: transparent !important; outline: none !important;
                    font-weight: 700 !important; color: var(--index-text-heading) !important; font-size: 0.9rem !important;
                }
                .staff-scope .users-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
                .staff-scope .users-table th {
                    text-align: left; padding: 1rem; color: var(--index-text-secondary);
                    font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--index-hover-bg);
                }
                .staff-scope .users-table td { padding: 1.1rem 1rem; border-bottom: 1px solid var(--index-hover-bg); vertical-align: middle; }
                .staff-scope .role-badge {
                    display: inline-block; padding: 3px 10px; border-radius: 999px;
                    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;
                }
                .staff-scope .role-badge.instructor { background: color-mix(in srgb, var(--index-primary-color) 15%, transparent); color: var(--index-primary-color); }
                .staff-scope .role-badge.student { background: var(--index-hover-bg); color: var(--index-text-secondary); }
                .staff-scope .btn-manage-permissions {
                    background: var(--index-hover-bg); border: 1px solid var(--index-border-color);
                    color: var(--index-text-heading); padding: 0.5rem 1rem; border-radius: 8px;
                    font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
                }
                .staff-scope .modal-overlay {
                    position: fixed; inset: 0; background: color-mix(in srgb, var(--lgl-charcoal) 60%, transparent);
                    backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .staff-scope .modal-content {
                    background: white; width: 100%; max-width: 520px; border-radius: 28px; padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; max-height: 85vh; overflow-y: auto;
                }
                .staff-scope .modal-close-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; cursor: pointer; color: var(--index-text-secondary); }
                .staff-scope .permission-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0.85rem 1rem; border: 1.5px solid var(--index-hover-bg); border-radius: 14px; margin-bottom: 0.6rem;
                }
                .staff-scope .permission-row label { font-weight: 700; color: var(--index-text-heading); font-size: 0.92rem; cursor: pointer; }
                .staff-scope .toggle-switch { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
                .staff-scope .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .staff-scope .toggle-slider {
                    position: absolute; cursor: pointer; inset: 0; background: var(--index-hover-bg);
                    border-radius: 999px; transition: 0.2s;
                }
                .staff-scope .toggle-slider:before {
                    content: ""; position: absolute; height: 18px; width: 18px; left: 3px; top: 3px;
                    background: white; border-radius: 50%; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }
                .staff-scope input:checked + .toggle-slider { background: var(--lgl-success, #16a34a); }
                .staff-scope input:checked + .toggle-slider:before { transform: translateX(18px); }
                .staff-scope .modal-submit-btn {
                    width: 100%; padding: 1rem; background: var(--index-text-heading); color: white;
                    border: none; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; margin-top: 1rem;
                }
            `}</style>

            <div className="users-card">
                <div className="users-header">
                    <h2>Users ({filteredUsers.length})</h2>
                </div>

                <div className="search-filter-belt">
                    <div className="search-box-wrapper">
                        <Search size={18} color="var(--index-text-faint)" />
                        <input className="search-input" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-dropdown-wrapper">
                        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
                            <option value="all">All Roles</option>
                            <option value="instructor">Instructors</option>
                            <option value="student">Students</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--index-text-heading)" style={{ margin: '0 auto' }} />
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
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'right' }}>Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--index-text-heading)' }}>{u.name}</td>
                                        <td style={{ color: 'var(--index-text-secondary)' }}>{u.email}</td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-manage-permissions" onClick={() => openPermissions(u)}>
                                                <ShieldCheck size={15} /> Permissions
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '5rem', color: 'var(--index-text-secondary)', fontWeight: 800 }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {activeUser && (
                <div className="modal-overlay" onClick={() => setActiveUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setActiveUser(null)}><X size={20} /></button>
                        <h3 style={{ margin: '0 0 0.25rem' }}>{activeUser.name}</h3>
                        <p style={{ margin: '0 0 1.5rem', color: 'var(--index-text-secondary)', fontSize: '0.9rem' }}>
                            Toggle a page off to block this user from it &mdash; in the sidebar and on the server.
                        </p>

                        {permissionsLoading ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto' }} />
                            </div>
                        ) : relevantPages.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                                {activeUser.role === 'student'
                                    ? 'Page-level permissions are not yet available for student accounts.'
                                    : 'No manageable pages for this account.'}
                            </div>
                        ) : (
                            <>
                                {relevantPages.map((page) => {
                                    const enabled = !disabledPages.includes(page.key);
                                    return (
                                        <div className="permission-row" key={page.key}>
                                            <label htmlFor={`perm-${page.key}`}>{page.label}</label>
                                            <div className="toggle-switch">
                                                <input
                                                    id={`perm-${page.key}`}
                                                    type="checkbox"
                                                    checked={enabled}
                                                    onChange={() => togglePage(page.key)}
                                                />
                                                <span className="toggle-slider" onClick={() => togglePage(page.key)} />
                                            </div>
                                        </div>
                                    );
                                })}

                                <button className="modal-submit-btn" onClick={savePermissions} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
