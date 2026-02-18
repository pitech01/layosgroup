import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar" style={{ borderRightColor: 'rgba(239, 68, 68, 0.3)' }}>
                <h2 style={{ color: '#f87171', marginBottom: '2rem' }}>Admin Panel</h2>
                <nav className="sidebar-nav">
                    <Link to="/admin-dashboard" className="nav-item active">Platform Overview</Link>
                    <Link to="#" className="nav-item">Manage Users</Link>
                    <Link to="#" className="nav-item">Manage Courses</Link>
                    <Link to="#" className="nav-item">Settings</Link>

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
                    <h2>Admin Dashboard</h2>
                    <div className="profile-pill">Administrator</div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
