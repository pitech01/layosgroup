import {
    Search,
    Plus,
    ExternalLink,
    Loader2,
    AlertCircle,
    Trash2,
    Edit,
    Users,
    Download,
    Mail,
    Phone,
    Calendar,
    BadgeCheck,
    MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Students() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
                toast.success('Student record purged');
            } else {
                toast.error('Purging protocol failed. Conflict detected.');
            }
        } catch (err) {
            toast.error('Signal loss during operation.');
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in-up">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Users className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Student Information System</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight">
                        Academic <span className="text-brand-emerald">Directory</span>
                    </h1>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">
                        Manage active cadet records, monitor enrollment status, and maintain student identity synchronization across the curriculum.
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none h-14 px-8 bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border-none cursor-pointer hover:bg-brand-charcoal hover:text-white dark:hover:bg-brand-emerald transition-all">
                        <Download size={18} /> Export Records
                    </button>
                    <button 
                        onClick={() => navigate('/instructor/students/add')}
                        className="flex-1 md:flex-none h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 border-none cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Enroll Cadet
                    </button>
                </div>
            </header>

            {/* Search Belt */}
            <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                    <Search size={22} />
                </div>
                <input
                    type="text"
                    placeholder="Search by identity, endpoint, or cadet ID..."
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Area */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border border-dashed">
                        <Loader2 className="animate-spin text-brand-emerald" size={64} />
                        <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Syncing Cadet Directory...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-[40px] p-16 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Sync Protocol Failure</h3>
                            <p className="text-brand-muted font-medium max-w-md mx-auto">{error}</p>
                        </div>
                        <button onClick={fetchStudents} className="h-12 px-8 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer">
                            Retry Handshake
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-brand-beige/50 dark:bg-white/5">
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Rank & Identity</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Endpoint Contact</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Deployment Date</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Active Vectors</th>
                                        <th className="text-right px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Protocols</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                                        <tr key={user.id} className={`group hover:bg-brand-beige/20 dark:hover:bg-white/5 transition-colors ${idx !== filteredUsers.length - 1 ? 'border-b border-brand-border' : ''}`}>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6 cursor-pointer group/item" onClick={() => navigate(`/instructor/students/${user.id}`)}>
                                                    <div className="w-14 h-14 rounded-2xl bg-brand-charcoal dark:bg-brand-emerald text-white flex items-center justify-center font-black shadow-lg shadow-brand-charcoal/10 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover/item:text-brand-emerald transition-colors truncate">{user.name}</h4>
                                                            <BadgeCheck size={14} className="text-brand-emerald shrink-0" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Cadet ID: #{user.id.toString().padStart(6, '0')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 text-sm font-bold text-brand-charcoal dark:text-white">
                                                        <Mail size={16} className="text-brand-emerald" /> {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-3 text-xs font-medium text-brand-muted">
                                                            <Phone size={14} className="text-brand-emerald" /> {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 text-xs font-bold text-brand-muted uppercase tracking-widest">
                                                    <Calendar size={16} className="text-brand-emerald" /> 
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {user.cohorts?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2 max-w-[300px]">
                                                        {user.cohorts.map((c: any) => (
                                                            <span key={c.id} className="px-3 py-1 bg-brand-beige dark:bg-white/10 border border-brand-border rounded-lg text-[8px] font-black text-brand-charcoal dark:text-white uppercase tracking-widest">{c.name || c.id}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest opacity-50 italic">Null Vector</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button 
                                                        onClick={() => navigate(`/instructor/students/${user.id}/edit`)}
                                                        className="h-11 w-11 flex items-center justify-center bg-white dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white border-2 border-brand-border rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteStudent(user.id)}
                                                        className="h-11 w-11 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-32 text-center">
                                                <div className="space-y-6">
                                                    <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-brand-muted/30 border border-brand-border border-dashed">
                                                        <Search size={40} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Zero Results</h3>
                                                        <p className="text-brand-muted font-medium">No cadets matched your search criteria in the central directory.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
