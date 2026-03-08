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
    const buttonRef = useRef<HTMLDivElement>(null);
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
        <div className="profile-dropdown-container">
            <div
                ref={buttonRef}
                className={`user-profile-pill ${isOpen ? 'is-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`user-avatar-small ${role === 'instructor' ? 'role-instructor' : 'role-student'}`}>
                    {userInitial}
                </div>
                <div className="user-info-text">
                    <span className="user-name">{userData.name}</span>
                    {userData.tier && <span className="user-role">{userData.tier}</span>}
                </div>
                <ChevronDown
                    size={14}
                    className="dropdown-arrow"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                />
            </div>

            {isOpen && (
                <div className="notifications-dropdown-premium profile-dropdown-menu" ref={dropdownRef}>
                    <div className="profile-dropdown-header">
                        <p className="profile-dropdown-name">{userData.name}</p>
                        <p className="profile-dropdown-email">{userData.email}</p>
                    </div>

                    <div className="profile-dropdown-actions">
                        <button
                            className="profile-dropdown-btn"
                            onClick={() => { setIsOpen(false); navigate(role === 'instructor' ? '/instructor/settings' : '/student/account'); }}
                        >
                            <User size={18} />
                            <span>My Profile</span>
                        </button>

                        <div className="profile-dropdown-divider"></div>

                        <button
                            className="profile-dropdown-btn logout"
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
