import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ShieldCheck, Download, 
    Loader2, 
    Lock, Award, Printer, CheckCircle,
    ArrowRight, X, Maximize2, ShieldAlert, Cpu
} from 'lucide-react';

interface Certificate {
    full_name: string;
    course_title: string;
    issued_at: string;
    certificate_uuid: string;
    issued_by: string;
    certificate_url?: string;
    qr_url?: string;
}

const CertificateVerification = () => {
    const { uuid } = useParams();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`${API_URL}/certificates/verify/${uuid}`);
                setCertificate(res.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [uuid]);

    const handleDownload = async () => {
        try {
            const response = await axios({
                url: `${API_URL}/certificates/download/${uuid}`,
                method: 'GET',
                responseType: 'blob', // IMPORTANT
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${uuid}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Security signature mismatch or network timeout. Please try again.');
        }
    };

    if (loading) return (
        <div className="verify-loader-screen">
            <div className="verify-loader-content">
                <Loader2 className="verify-spinner" size={64} />
                <h2 className="verify-loader-text">AUTHENTICATING...</h2>
                <p className="verify-loader-sub">SECURE REGISTRY ACCESS</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="verify-container">
            <div className="verify-card error-card">
                <div className="verify-icon-wrapper error">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="verify-title">Unverified Record</h1>
                <p className="verify-description">
                    The security key <span className="highlight">{uuid}</span> could not be authenticated against our global ledger.
                </p>
                
                <div className="verify-diagnostics">
                    <span className="diag-label">NETWORK DIAGNOSTICS</span>
                    <code>Endpoint: {API_URL}/certificates/verify/{uuid}</code>
                    <p className="diag-tip">Check connection or ensure code is correct.</p>
                </div>

                <Link to="/" className="verify-button">
                    BACK TO PLATFORM <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="verify-page">
            <div className="verify-header">
                <div className="verify-logo-section">
                    <div className="verify-logo-box">
                        <Lock size={24} />
                    </div>
                    <div className="verify-brand">
                        <h3>LAYOS GROUP</h3>
                        <p>OFFICIAL VERIFICATION PORTAL</p>
                    </div>
                </div>
                <div className="verify-status-badge">
                    <div className="pulse-dot"></div>
                    REAL-TIME LEDGER STATUS: ACTIVE
                </div>
            </div>

            <main className="verify-main">
                <div className="verify-grid">
                    {/* Left: Certificate Preview */}
                    <div className="verify-preview-section">
                        <div className="certificate-frame">
                            <div className="certificate-inner">
                                {certificate?.certificate_url ? (
                                    <img 
                                        src={certificate.certificate_url} 
                                        alt="Official Certificate" 
                                        onClick={() => setPreviewOpen(true)}
                                    />
                                ) : (
                                    <div className="certificate-placeholder">
                                        <Cpu size={48} />
                                        <p>Secure Image Loading...</p>
                                    </div>
                                )}
                                <div className="certificate-overlay" onClick={() => setPreviewOpen(true)}>
                                    <Maximize2 size={24} />
                                    <span>ZOOM PREVIEW</span>
                                </div>
                            </div>
                            <div className="seal-badge">
                                <Award size={40} />
                            </div>
                        </div>
                    </div>

                    {/* Right: metadata */}
                    <div className="verify-data-section">
                        <div className="info-card">
                            <div className="verified-chip">
                                <CheckCircle size={14} />
                                RECORD AUTHENTICATED
                            </div>
                            
                            <h1 className="credential-title">
                                CREDENTIAL<br/>
                                <span className="gold">VALIDATED</span>
                            </h1>
                            
                            <div className="serial-number">
                                <Lock size={12} /> REGISTER ID: {uuid}
                            </div>

                            <div className="info-fields">
                                <div className="info-field">
                                    <label>HOLDER NAME</label>
                                    <p className="name-val">{certificate?.full_name}</p>
                                </div>
                                <div className="divider"></div>
                                <div className="info-field">
                                    <label>ACCREDITATION</label>
                                    <p className="course-val">{certificate?.course_title}</p>
                                </div>
                            </div>

                            <div className="info-metrics">
                                <div className="metric">
                                    <label>DATE ISSUED</label>
                                    <span>{new Date(certificate?.issued_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="metric">
                                    <label>AUTHORITY</label>
                                    <span>{certificate?.issued_by || 'LAYOS GROUP'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="action-card">
                            <div className="action-buttons">
                                <button onClick={handleDownload} className="btn-primary">
                                    <Download size={20} /> OFFICIAL DOWNLOAD
                                </button>
                                <button onClick={() => window.print()} className="btn-secondary">
                                    <Printer size={20} />
                                </button>
                            </div>
                            <p className="trust-note">
                                <ShieldCheck size={14} /> Cryptographic signature verified
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="verify-footer">
                <p>© 2026 Layos Group Secure Registry Authority</p>
            </footer>

            {/* Modal */}
            {previewOpen && (
                <div className="preview-modal" onClick={() => setPreviewOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setPreviewOpen(false)}><X size={32}/></button>
                        <img src={certificate?.certificate_url} alt="HD Preview" />
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&family=Space+Grotesk:wght@300;700&display=swap');

                .verify-page {
                    min-height: 100vh;
                    background: #f0f2f5;
                    font-family: 'Outfit', sans-serif;
                    color: #1a1a1a;
                    padding: 40px 20px;
                }

                @media print {
                    .verify-header, .verify-footer, .action-card, .info-card, .verify-status-badge, .seal-badge, .certificate-overlay {
                        display: none !important;
                    }
                    .verify-page {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .verify-main {
                        margin: 0 !important;
                        max-width: none !important;
                    }
                    .verify-grid {
                        display: block !important;
                    }
                    .certificate-frame {
                        box-shadow: none !important;
                        padding: 0 !important;
                        border: none !important;
                        background: none !important;
                    }
                    .certificate-inner {
                        border: none !important;
                        border-radius: 0 !important;
                        aspect-ratio: auto !important;
                    }
                    .certificate-inner img {
                        width: 100% !important;
                        height: auto !important;
                        max-height: 100vh !important;
                        object-fit: contain !important;
                    }
                }

                .verify-header {
                    max-width: 1200px;
                    margin: 0 auto 60px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                
                /* [Rest of the existing styles remained same, only added @media print above] */
                .verify-logo-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .verify-logo-box {
                    background: #1a4d3e;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px rgba(26,77,62,0.15);
                }

                .verify-brand h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 900;
                    letter-spacing: -1px;
                    color: #1a4d3e;
                }

                .verify-brand p {
                    margin: 0;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .verify-status-badge {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(10px);
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }

                .verify-main {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .verify-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 40px;
                    align-items: start;
                }

                @media (max-width: 1024px) {
                    .verify-grid { grid-template-columns: 1fr; }
                    .verify-header { justify-content: center; text-align: center; }
                    .verify-logo-section { flex-direction: column; }
                }

                .certificate-frame {
                    background: white;
                    padding: 15px;
                    border-radius: 50px;
                    box-shadow: 0 40px 80px -20px rgba(26,77,62,0.15);
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .certificate-inner {
                    aspect-ratio: 1.414/1;
                    background: #f8fafc;
                    border-radius: 35px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid #e2e8f0;
                }

                .certificate-inner img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                    transition: transform 0.5s ease;
                }

                .certificate-inner:hover img { transform: scale(1.02); }

                .certificate-overlay {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    padding: 40px 20px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: white;
                    opacity: 0;
                    transition: 0.3s;
                    cursor: pointer;
                }

                .certificate-inner:hover .certificate-overlay { opacity: 1; }

                .seal-badge {
                    position: absolute;
                    top: -20px;
                    left: -20px;
                    width: 100px;
                    height: 100px;
                    background: #fbbf24;
                    color: white;
                    border-radius: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 15px 30px rgba(251,191,36,0.3);
                    border: 6px solid white;
                    transform: rotate(-10deg);
                }

                .info-card {
                    background: #1a4d3e;
                    color: white;
                    padding: 50px;
                    border-radius: 60px;
                    box-shadow: 0 30px 60px rgba(26,77,62,0.2);
                    margin-bottom: 30px;
                    position: relative;
                    overflow: hidden;
                }

                .verified-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    padding: 10px 20px;
                    border-radius: 100px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 2px;
                    border: 1px solid rgba(255,255,255,0.1);
                    margin-bottom: 40px;
                }

                .credential-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    line-height: 0.9;
                    margin: 0 0 20px;
                    letter-spacing: -2px;
                    text-transform: uppercase;
                }

                .gold { color: #fbbf24; }

                .serial-number {
                    font-size: 0.65rem;
                    font-weight: 600;
                    opacity: 0.4;
                    letter-spacing: 2px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 60px;
                }

                .info-fields { margin-bottom: 40px; }
                .info-field label {
                    display: block;
                    font-size: 0.6rem;
                    font-weight: 900;
                    color: #fbbf24;
                    letter-spacing: 3px;
                    margin-bottom: 10px;
                }

                .name-val { font-size: 2rem; font-weight: 900; margin: 0; letter-spacing: -1px; }
                .course-val { font-size: 1.25rem; font-weight: 700; margin: 0; line-height: 1.3; }

                .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 30px 0; }

                .info-metrics {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                }

                .metric label {
                    display: block;
                    font-size: 0.55rem;
                    font-weight: 900;
                    opacity: 0.4;
                    letter-spacing: 2px;
                    margin-bottom: 5px;
                }

                .metric span { font-weight: 900; font-size: 0.9rem; }

                .action-card {
                    background: white;
                    padding: 30px;
                    border-radius: 40px;
                    border: 1px solid #e2e8f0;
                }

                .action-buttons {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .btn-primary {
                    flex: 1;
                    background: #1a4d3e;
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 900;
                    font-size: 0.8rem;
                    padding: 20px;
                    border-radius: 20px;
                    transition: 0.3s;
                }

                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(26,77,62,0.2); }

                .btn-secondary {
                    width: 65px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                }

                .trust-note {
                    margin: 0;
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .verify-footer {
                    text-align: center;
                    padding: 60px 0;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #94a3b8;
                }

                .preview-modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    max-width: 1000px;
                    width: 100%;
                    position: relative;
                }

                .modal-content img {
                    width: 100%;
                    border-radius: 30px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                }

                .close-modal {
                    position: absolute;
                    top: -60px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }

                /* Loader Styles */
                .verify-loader-screen {
                    min-height: 100vh;
                    background: #0d0f14;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-family: 'Space Grotesk', sans-serif;
                }

                .verify-spinner {
                    color: #fbbf24;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                .verify-loader-text { font-weight: 700; font-size: 1.5rem; letter-spacing: 5px; margin: 0; }
                .verify-loader-sub { font-size: 0.7rem; color: #475569; letter-spacing: 3px; font-weight: 700; }

                /* Error Card */
                .error-card { text-align: center; padding: 60px !important; border-top: 10px solid #ef4444 !important; }
                .verify-icon-wrapper.error { color: #ef4444; margin-bottom: 30px; }
                .verify-diagnostics { padding: 20px; background: #f8fafc; border-radius: 20px; text-align: left; margin: 30px 0; border: 1px solid #e2e8f0; }
                .diag-label { font-size: 0.6rem; font-weight: 900; color: #94a3b8; display: block; margin-bottom: 10px; }
                .verify-diagnostics code { font-size: 0.6rem; color: #ef4444; word-break: break-all; }
                .diag-tip { font-size: 0.6rem; color: #64748b; margin: 10px 0 0; }
            `}</style>
        </div>
    );
};

export default CertificateVerification;




