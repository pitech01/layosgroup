import {
    Check,
    Search,
    Loader2,
    Clock,
    User,
    BookOpen,
    DollarSign,
    X,
    Maximize2
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PendingVerification {
    user_id: number;
    cohort_id: string;
    student_name: string;
    student_email: string;
    cohort_name: string;
    pricing: number;
    receipt_path: string | null;
    payment_status: string;
    updated_at: string;
}

export default function PaymentVerification() {
    const [pendingList, setPendingList] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const STORAGE_URL = API_URL.replace('/api', '/storage');

    const fetchPendingVerifications = async () => {
        try {
            const response = await fetch(`${API_URL}/instructor/pending-verifications`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPendingList(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Fetch Pending Verifications Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const handleAction = async (userId: number, cohortId: string, status: 'full' | 'unpaid') => {
        setProcessingId(`${userId}-${cohortId}`);
        try {
            const response = await fetch(`${API_URL}/cohorts/${cohortId}/students/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ payment_status: status })
            });

            if (response.ok) {
                setPendingList(prev => prev.filter(item => !(item.user_id === userId && item.cohort_id === cohortId)));
            } else {
                console.error("Failed to update payment status");
            }
        } catch (err) {
            console.error("Update Payment Status Error:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredList = pendingList.filter(p =>
        p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cohort_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
        );
    }

    return (
        <div className="payment-verification animate-fade-in-up">
            <style>{`
                .payment-verification {
                    padding: 1.5rem;
                }
                .pv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .pv-header h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                @media (max-width: 640px) {
                    .pv-header {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                    }
                    .pv-header h2 { font-size: 1.4rem; }
                    .search-container { max-width: 100%; }
                }
                .glass-panel-pv {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                }
                @media (max-width: 768px) {
                    .glass-panel-pv { padding: 1rem; }
                    .pv-table thead { display: none; }
                    .pv-table, .pv-table tbody, .pv-table tr, .pv-table td { display: block; width: 100%; }
                    .pv-row { 
                        margin-bottom: 1rem; 
                        border: 1px solid #f1f5f9 !important;
                        padding: 1rem;
                    }
                    .pv-row td { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        padding: 0.6rem 0 !important;
                        border: none !important;
                    }
                    .pv-row td::before {
                        content: attr(data-label);
                        font-weight: 700;
                        color: #64748b;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                    }
                    .student-info { justify-content: flex-end; width: 100%; }
                    .action-btns { justify-content: flex-end; width: 100%; }
                }
                .search-container {
                    margin-bottom: 1.5rem;
                    position: relative;
                    max-width: 400px;
                }
                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    outline: none;
                    transition: all 0.2s;
                }
                .search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .pv-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                }
                .pv-table th {
                    text-align: left;
                    padding: 1rem;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .pv-row {
                    background: white;
                    border-radius: 12px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .pv-row:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                }
                .pv-row td {
                    padding: 1rem;
                    border-top: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                }
                .pv-row td:first-child {
                    border-left: 1px solid #f1f5f9;
                    border-radius: 12px 0 0 12px;
                }
                .pv-row td:last-child {
                    border-right: 1px solid #f1f5f9;
                    border-radius: 0 12px 12px 0;
                }
                .student-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .student-avatar {
                    width: 40px;
                    height: 40px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }
                .receipt-preview-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #3b82f6;
                    font-weight: 600;
                    font-size: 0.9rem;
                    padding: 6px 12px;
                    background: #eff6ff;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .receipt-preview-link:hover {
                    background: #dbeafe;
                    transform: scale(1.02);
                }
                .action-btns {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-approve {
                    background: #f0fdf4;
                    color: #16a34a;
                }
                .btn-approve:hover:not(:disabled) {
                    background: #dcfce7;
                    transform: scale(1.1);
                }
                .btn-reject {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .btn-reject:hover:not(:disabled) {
                    background: #fee2e2;
                    transform: scale(1.1);
                }
                .btn-icon:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s ease-out;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .preview-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 2rem;
                    animation: fadeIn 0.3s ease-out;
                }
                .preview-content-card {
                    background: white;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                }
                @media (max-width: 640px) {
                    .preview-modal-overlay { padding: 1rem; }
                    .preview-content-card { border-radius: 16px; }
                    .preview-header { padding: 1rem; }
                    .preview-header h3 { font-size: 1rem; }
                }
                .preview-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .close-preview {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .close-preview:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    transform: rotate(90deg);
                }
                .preview-body {
                    flex: 1;
                    overflow: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    min-height: 400px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            {previewUrl && (
                <div className="preview-modal-overlay" onClick={() => setPreviewUrl(null)}>
                    <div className="preview-content-card" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Maximize2 size={18} /> Receipt Preview
                            </h3>
                            <button className="close-preview" onClick={() => setPreviewUrl(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="preview-body">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    style={{ width: '100%', height: '70vh', border: 'none' }}
                                    title="PDF Receipt"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '78vh',
                                        objectFit: 'contain',
                                        userSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                    onContextMenu={(e: any) => e.preventDefault()}
                                    alt="Receipt Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pv-header">
                <div>
                    <h2>Payment Verification</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Review and approve student payment claims.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748b" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{pendingList.length} Pending</span>
                    </div>
                </div>
            </div>

            <div className="glass-panel-pv">
                <div className="search-container">
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by student or cohort name..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="pv-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Cohort</th>
                                <th>Amount</th>
                                <th>Proof of Payment</th>
                                <th>Submitted On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map((p) => (
                                <tr key={`${p.user_id}-${p.cohort_id}`} className="pv-row">
                                    <td data-label="Student">
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                <User size={20} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.student_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.student_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Cohort">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                            <BookOpen size={14} color="#64748b" />
                                            <span style={{ fontWeight: 600, color: '#334155', textAlign: 'right' }}>{p.cohort_name}</span>
                                        </div>
                                    </td>
                                    <td data-label="Amount">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 800, color: '#0f172a', justifyContent: 'flex-end' }}>
                                            <DollarSign size={14} />
                                            <span>{p.pricing.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td data-label="Proof">
                                        {p.receipt_path ? (
                                            <button
                                                onClick={() => {
                                                    const url = p.receipt_path?.startsWith('http') ? p.receipt_path : `${STORAGE_URL}/${p.receipt_path}`;
                                                    setPreviewUrl(url);
                                                }}
                                                className="receipt-preview-link"
                                                style={{ cursor: 'pointer', border: 'none' }}
                                            >
                                                Preview <Maximize2 size={12} />
                                            </button>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No receipt</span>
                                        )}
                                    </td>
                                    <td data-label="Submitted">
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textAlign: 'right' }}>
                                            {new Date(p.updated_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="action-btns">
                                            <button
                                                className="btn-icon btn-approve"
                                                title="Approve Payment"
                                                onClick={() => handleAction(p.user_id, p.cohort_id, 'full')}
                                                disabled={processingId === `${p.user_id}-${p.cohort_id}`}
                                            >
                                                {processingId === `${p.user_id}-${p.cohort_id}` ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} color="#16a34a" />}
                                            </button>
                                            <button
                                                className="btn-icon btn-reject"
                                                title="Reject Payment"
                                                onClick={() => handleAction(p.user_id, p.cohort_id, 'unpaid')}
                                                disabled={processingId === `${p.user_id}-${p.cohort_id}`}
                                            >
                                                <X size={18} color="#dc2626" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredList.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Check size={32} color="#10b981" />
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>All Caught Up!</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>There are no pending payment verifications at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
