export default function AdminDashboard() {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: '#2563eb' }}>1,240</h3>
                    <p style={{ color: '#64748b' }}>Active Students</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: '#7c3aed' }}>54</h3>
                    <p style={{ color: '#64748b' }}>Instructors</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: '#059669' }}>86</h3>
                    <p style={{ color: '#64748b' }}>Active Courses</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: '#dc2626' }}>$12.5k</h3>
                    <p style={{ color: '#64748b' }}>Revenue (Mo)</p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <h3 className="flex-1">Platform Overview</h3>
                <button style={{ background: '#ef4444' }}>Generate Reports</button>
            </div>

            <div className="glass-panel">
                <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <h4>System Health</h4>
                    <span style={{ color: '#34d399' }}>● Operational</span>
                </div>
                <div className="flex gap-2">
                    <button style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>Manage Users</button>
                    <button style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>System Settings</button>
                </div>
            </div>
        </div>
    );
}
