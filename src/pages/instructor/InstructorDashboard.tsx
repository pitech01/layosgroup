export default function InstructorDashboard() {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3>Course Management</h3>
                <button style={{ background: '#8b5cf6' }}>+ Create New Course</button>
            </div>

            <div className="glass-panel mb-4">
                <h4 style={{ color: '#a78bfa', marginTop: 0 }}>Quick Actions</h4>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <button style={{ background: 'transparent', border: '1px solid #7c3aed', color: '#7c3aed' }}>Upload Recorded Lesson</button>
                    <button style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>Schedule Live Class</button>
                    <button style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb' }}>Grade Assignments</button>
                </div>
            </div>

            <h3>Recent Activity</h3>
            <div className="glass-panel">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Student</th>
                            <th style={{ padding: '1rem' }}>Course</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                            <th style={{ padding: '1rem' }}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '1rem' }}>Alex Johnson</td>
                            <td style={{ padding: '1rem' }}>Frontend Dev</td>
                            <td style={{ padding: '1rem' }}>Completed Lesson 3</td>
                            <td style={{ padding: '1rem', color: '#64748b' }}>2 mins ago</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem' }}>Maria Garcia</td>
                            <td style={{ padding: '1rem' }}>React Masterclass</td>
                            <td style={{ padding: '1rem' }}>Joined Live Session</td>
                            <td style={{ padding: '1rem', color: '#64748b' }}>15 mins ago</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
