import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Clock, Search, ShieldCheck, Sparkles, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface InstructorTopbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const InstructorTopbar = ({ collapsed, setCollapsed }: InstructorTopbarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const bellBtnRef = useRef<HTMLButtonElement>(null);
    const profileBtnRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const userName = user?.name || "Instructor Hub";
    const userRole = user?.role === 'instructor' ? "Lead Instructor" : "Administrator";
    const userInitial = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "I";

    const notifications = [
        { id: 1, title: 'New Student Enrolled', desc: 'Alex Johnson joined "Frontend Dev Bootcamp".', time: '5m ago', unread: true },
        { id: 2, title: 'Live Class Reminder', desc: 'Your session "Advanced React" starts in 30 mins.', time: '1h ago', unread: true },
        { id: 3, title: 'Review Received', desc: 'New 5-star review for "UI/UX Design".', time: '1d ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node) &&
                bellBtnRef.current &&
                !bellBtnRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }

            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node) &&
                profileBtnRef.current &&
                !profileBtnRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-28 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-[40]">
            {/* Left Section */}
            <div className="flex items-center gap-8">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-3 bg-brand-beige/50 dark:bg-white/5 text-brand-muted hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-2xl transition-all border-none cursor-pointer group"
                >
                    <Menu size={24} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="hidden lg:flex relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search operational data..."
                        className="h-14 w-80 pl-14 pr-6 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-xs font-black uppercase tracking-widest text-brand-charcoal dark:text-white"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative">
                    <button
                        ref={bellBtnRef}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-3.5 rounded-2xl transition-all border-none cursor-pointer relative group ${showNotifications ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' : 'bg-brand-beige/50 dark:bg-white/5 text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                    >
                        <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-brand-charcoal rounded-full"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div ref={notificationRef} className="absolute top-full right-0 mt-6 w-[400px] bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border shadow-2xl animate-fade-in-up overflow-hidden z-[50]">
                            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-beige/10 dark:bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-brand-emerald" size={18} />
                                    <h4 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Protocol Alerts</h4>
                                </div>
                                <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest cursor-pointer hover:underline">Clear Manifest</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="p-8 hover:bg-brand-beige/20 dark:hover:bg-white/5 transition-all border-b border-brand-border last:border-none group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{notif.title}</h5>
                                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> {notif.time}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-brand-muted leading-relaxed">{notif.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 text-center bg-brand-beige/10 dark:bg-white/5">
                                <button className="text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all border-none bg-transparent cursor-pointer">View All Transmissions</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Pill */}
                <div className="relative">
                    <div
                        ref={profileBtnRef}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={`flex items-center gap-4 pl-3 pr-5 py-2.5 rounded-2xl transition-all cursor-pointer group ${showProfileMenu ? 'bg-brand-charcoal text-white shadow-xl shadow-brand-charcoal/20' : 'bg-brand-beige/50 dark:bg-white/5 border border-brand-border hover:border-brand-emerald'}`}
                    >
                        <div className="w-12 h-12 bg-brand-emerald rounded-xl flex items-center justify-center font-black text-white text-lg shadow-inner group-hover:scale-105 transition-transform">
                            {userInitial}
                        </div>
                        <div className="hidden md:block">
                            <div className={`text-[11px] font-black uppercase tracking-tight leading-none mb-1 ${showProfileMenu ? 'text-white' : 'text-brand-charcoal dark:text-white'}`}>{userName}</div>
                            <div className={`text-[9px] font-black uppercase tracking-widest ${showProfileMenu ? 'text-brand-emerald' : 'text-brand-muted'}`}>{userRole}</div>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180 text-brand-emerald' : 'text-brand-muted'}`} />
                    </div>

                    {showProfileMenu && (
                        <div ref={profileMenuRef} className="absolute top-full right-0 mt-6 w-72 bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border shadow-2xl animate-fade-in-up overflow-hidden z-[50]">
                            <div className="p-10 text-center border-b border-brand-border bg-brand-beige/10 dark:bg-white/5">
                                <div className="w-20 h-20 bg-brand-emerald rounded-[28px] flex items-center justify-center font-black text-white text-3xl mx-auto mb-4 shadow-xl shadow-brand-emerald/20">
                                    {userInitial}
                                </div>
                                <h5 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{userName}</h5>
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">{userRole}</p>
                            </div>
                            <div className="p-4 space-y-2">
                                <button 
                                    onClick={() => { navigate('/instructor/settings'); setShowProfileMenu(false); }}
                                    className="w-full h-14 px-6 flex items-center gap-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-brand-muted hover:bg-brand-emerald hover:text-white transition-all border-none cursor-pointer group"
                                >
                                    <User size={18} className="text-brand-emerald group-hover:text-white transition-colors" /> Operational Profile
                                </button>
                                <button 
                                    onClick={() => { navigate('/instructor/settings'); setShowProfileMenu(false); }}
                                    className="w-full h-14 px-6 flex items-center gap-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-brand-muted hover:bg-brand-emerald hover:text-white transition-all border-none cursor-pointer group"
                                >
                                    <SettingsIcon size={18} className="text-brand-emerald group-hover:text-white transition-colors" /> Security Config
                                </button>
                                <div className="h-[1px] bg-brand-border mx-4 my-2"></div>
                                <button 
                                    onClick={() => { logout(); navigate('/instructor-login'); }}
                                    className="w-full h-14 px-6 flex items-center gap-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer group"
                                >
                                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Close Terminal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default InstructorTopbar;
