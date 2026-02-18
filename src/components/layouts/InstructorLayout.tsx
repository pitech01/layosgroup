import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InstructorLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/instructor-login');
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar" style={{ borderRightColor: 'rgba(139, 92, 246, 0.3)' }}>
                <h2 style={{ color: '#a78bfa', marginBottom: '2rem' }}>Instructor Hub</h2>
                <nav className="sidebar-nav">
                    <Link to="/instructor-dashboard" className="nav-item active">Dashboard</Link>
                    <Link to="#" className="nav-item">Create Course</Link>
                    <Link to="#" className="nav-item">Upload Lesson</Link>
                    <Link to="#" className="nav-item">Schedule Live Class</Link>
                    <Link to="#" className="nav-item">View Students</Link>

                    <button
                        onClick={handleLogout}
                        className="nav-item"
                        style={{ marginTop: 'auto', background: 'transparent', textAlign: 'left', color: '#ef4444' }}
                    >
                        Logout
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                <header className="flex justify-between items-center mb-4">
                    <h2>Instructor Dashboard</h2>
                    <div className="profile-pill">Instructor User</div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};

export default InstructorLayout;
