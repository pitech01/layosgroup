import {
    Search,
    Plus,
    ChevronDown,
    ExternalLink,
    CheckCircle,
    Mail
} from 'lucide-react';

export default function Students() {
    const users = [
        {
            id: 96,
            name: 'Demo User',
            email: 'amentotech021@gmail.com',
            phone: '123654789',
            created: 'February 16, 2026',
            role: 'Tutor',
            isVerified: true,
            avatar: 'linear-gradient(135deg, #10b981, #bbf7d0)'
        },
        {
            id: 95,
            name: 'Test User',
            email: 'devin@teamento.com',
            phone: '',
            created: 'February 16, 2026',
            role: 'Student',
            isVerified: false,
            avatar: 'linear-gradient(135deg, #10b981, #bbf7d0)'
        },
        {
            id: 94,
            name: 'Test User',
            email: 'test@example.com',
            phone: '',
            created: 'February 16, 2026',
            role: 'Student',
            isVerified: true,
            avatar: 'linear-gradient(135deg, #10b981, #bbf7d0)'
        },
        {
            id: 91,
            name: 'Test Test',
            email: 'amentotech037@gmail.com',
            phone: '',
            created: 'November 27, 2024',
            role: 'Tutor',
            isVerified: true,
            avatar: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
        },
        {
            id: 90,
            name: 'John Doe',
            email: 'amentotech012@gmail.com',
            phone: '',
            created: 'November 27, 2024',
            role: 'Student',
            isVerified: false,
            avatar: 'linear-gradient(135deg, #10b981, #bbf7d0)'
        }
    ];

    return (
        <div className="all-users-container">
            <style>{`
                .all-users-container {
                    width: 100%;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .users-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .users-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .users-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .btn-export {
                    background-color: #020617; /* Dark navy */
                    color: white;
                    padding: 0.65rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                }

                .btn-add-user {
                    background-color: #020617;
                    color: white;
                    padding: 0.65rem 1.25rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .filter-pill {
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                }

                .search-pill-icon {
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .users-table th {
                    text-align: left;
                    padding: 1rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-bottom: 1px solid #f1f5f9;
                }

                .users-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .user-id {
                    color: #1e293b;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .avatar-circle {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    flex-shrink: 0;
                }

                .user-name {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .email-cell {
                    display: flex;
                    flex-direction: column;
                }

                .email-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .phone-text {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .date-text {
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }


                .verification-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.025em;
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 140px;
                    justify-content: center;
                }

                .verification-badge:hover {
                    background-color: #e2e8f0;
                }

                .verified {
                    color: #1e293b;
                }

                .non-verified {
                    color: #94a3b8;
                }

                .verification-icon {
                    color: #475569;
                }
            `}</style>

            <div className="users-card">
                <div className="users-header">
                    <h2>All users (31)</h2>
                    <div className="header-actions">
                        <button className="btn-export">Export</button>
                        <button className="btn-add-user">Add new user <Plus size={18} /></button>
                        <div className="filter-pill">All users <ChevronDown size={16} /></div>
                        <div className="filter-pill">Desc <ChevronDown size={16} /></div>
                        <div className="search-pill-icon"><Search size={18} /></div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>#</th>
                                <th>Name</th>
                                <th>Email/Phone</th>
                                <th>Created date</th>
                                <th style={{ textAlign: 'center' }}>Email Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="user-id">{user.id}</td>
                                    <td>
                                        <div className="name-cell">
                                            <div className="avatar-circle" style={{ background: user.avatar }} />
                                            <span className="user-name">
                                                {user.name} <ExternalLink size={14} style={{ color: '#94a3b8' }} />
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <span className="email-text">{user.email}</span>
                                            {user.phone && <span className="phone-text">{user.phone}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="date-text">{user.created}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className={`verification-badge ${user.isVerified ? 'verified' : 'non-verified'}`}>
                                            {user.isVerified ? (
                                                <>
                                                    <CheckCircle size={16} className="verification-icon" />
                                                    VERIFIED
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={16} className="verification-icon" />
                                                    NON VERIFIED
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
