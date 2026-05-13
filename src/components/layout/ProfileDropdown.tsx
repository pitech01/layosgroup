import { ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProfileDropdownProps {
    role: 'instructor' | 'student';
}

const ProfileDropdown = ({ role }: ProfileDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Dynamic user data
    const userData = {
        name: user?.name || (role === 'instructor' ? 'Instructor' : 'Student'),
        email: user?.email || (role === 'instructor' ? 'instructor@layos.edu' : 'student@layos.edu'),
        tier: user?.role === 'instructor' ? 'Instructor' : (user?.role === 'admin' ? 'Administrator' : '')
    };

    const userInitial = userData.name.charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate(role === 'instructor' ? '/instructor-login' : '/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={`flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full border transition-all cursor-pointer ${isOpen ? 'bg-brand-border border-brand-border' : 'bg-white dark:bg-brand-charcoal border-brand-border hover:border-brand-emerald shadow-sm hover:shadow-md'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm ${role === 'instructor' ? 'bg-indigo-600' : 'bg-brand-emerald'}`}>
                    {userInitial}
                </div>
                <div className="hidden sm:flex flex-col items-start ml-1">
                    <span className="text-sm font-bold text-brand-charcoal dark:text-white leading-tight">{userData.name}</span>
                    {userData.tier && <span className="text-[10px] text-brand-muted font-black uppercase tracking-wider leading-tight">{userData.tier}</span>}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-brand-muted ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-brand-charcoal border border-brand-border rounded-[24px] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 origin-top-right overflow-hidden"
                >
                    <div className="p-5 border-b border-brand-border bg-brand-beige/20 dark:bg-white/5">
                        <p className="font-black text-sm text-brand-charcoal dark:text-white truncate m-0">{userData.name}</p>
                        <p className="text-xs text-brand-muted font-medium truncate mt-1 m-0">{userData.email}</p>
                    </div>

                    <div className="p-2 flex flex-col gap-1">
                        <button
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-bold text-brand-charcoal dark:text-white hover:bg-brand-beige dark:hover:bg-white/10 transition-colors border-none cursor-pointer text-left group"
                            onClick={() => { setIsOpen(false); navigate(role === 'instructor' ? '/instructor/settings' : '/student/account'); }}
                        >
                            <User size={18} className="text-brand-muted group-hover:text-brand-emerald transition-colors" />
                            <span>My Profile</span>
                        </button>

                        <div className="h-px bg-brand-border my-1 mx-2"></div>

                        <button
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-none cursor-pointer text-left"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
