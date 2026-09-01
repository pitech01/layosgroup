import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, User, GraduationCap, UserCog } from 'lucide-react';

interface AppUser {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
}

interface AdminQuickSearchProps {
    open: boolean;
    onClose: () => void;
}

export default function AdminQuickSearch({ open, onClose }: AdminQuickSearchProps) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        setQuery('');
        setLoading(true);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        fetch(`${API_URL}/admin/users`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setUsers([]))
            .finally(() => setLoading(false));

        setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const results = query.trim()
        ? users.filter((u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())
        )
        : users.slice(0, 8);

    const goToUser = (user: AppUser) => {
        onClose();
        if (user.role === 'instructor') {
            navigate(`/admin/instructors?q=${encodeURIComponent(user.email)}`);
        } else {
            navigate(`/admin/users?q=${encodeURIComponent(user.email)}`);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--lgl-charcoal) 55%, transparent)',
                backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex',
                alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%', maxWidth: '560px', background: 'var(--index-card-bg)',
                    borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                    overflow: 'hidden', border: '1px solid var(--index-border-color)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--index-hover-bg)' }}>
                    <Search size={18} color="var(--index-text-faint)" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search instructors and students by name or email..."
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)',
                        }}
                    />
                    <button
                        onClick={onClose}
                        aria-label="Close search"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--index-text-secondary)', display: 'flex' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto' }} />
                        </div>
                    ) : results.length === 0 ? (
                        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                            No matching users.
                        </div>
                    ) : (
                        results.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => goToUser(user)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
                                    padding: '0.85rem 1.25rem', border: 'none', background: 'transparent',
                                    cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--index-hover-bg)',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--index-hover-bg)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '10px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white',
                                    background: user.role === 'instructor' ? 'var(--lgl-cyan-dark)' : 'var(--index-text-heading)',
                                }}>
                                    {user.role === 'instructor' ? <UserCog size={16} /> : <User size={16} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--index-text-heading)', fontSize: '0.9rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                                </div>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em',
                                    padding: '3px 8px', borderRadius: '999px', flexShrink: 0,
                                    background: 'var(--index-hover-bg)', color: 'var(--index-text-secondary)',
                                }}>
                                    {user.role}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {!query.trim() && !loading && users.length > 0 && (
                    <div style={{ padding: '0.6rem 1.25rem', fontSize: '0.75rem', color: 'var(--index-text-faint)', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--index-hover-bg)' }}>
                        <GraduationCap size={13} /> Showing recent users &mdash; keep typing to search all {users.length}
                    </div>
                )}
            </div>
        </div>
    );
}
