import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ShieldCheck, Download,
    Loader2,
    Lock, Award, Printer, CheckCircle,
    ArrowRight, X, Maximize2, ShieldAlert, Cpu, SearchCheck, RefreshCw, WifiOff
} from 'lucide-react';

interface Certificate {
    full_name: string;
    course_title: string;
    issued_at: string;
    certificate_uuid: string;
    issued_by: string;
    certificate_path?: string;
    qr_code_path?: string;
}

type VerifyErrorType = 'not_found' | 'network' | null;

const CertificateVerification = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState<VerifyErrorType>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [lookupCode, setLookupCode] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const verify = useCallback(async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await axios.get(`${API_URL}/certificates/verify/${uuid}`);
            setCertificate(res.data);
        } catch (err) {
            const isNotFound = axios.isAxiosError(err) && err.response?.status === 404;
            setErrorType(isNotFound ? 'not_found' : 'network');
        } finally {
            setLoading(false);
        }
    }, [API_URL, uuid]);

    useEffect(() => {
        verify();
    }, [verify]);

    const handleLookupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = lookupCode.trim();
        if (code) navigate(`/verify/${code.toUpperCase()}`);
    };

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
        } catch {
            alert('Security signature mismatch or network timeout. Please try again.');
        }
    };

    let body;

    if (loading) {
        body = (
            <div className="verify-loader-screen">
                <div className="verify-loader-content">
                    <Loader2 className="verify-spinner" size={64} />
                    <h2 className="verify-loader-text">AUTHENTICATING...</h2>
                    <p className="verify-loader-sub">SECURE REGISTRY ACCESS</p>
                </div>
            </div>
        );
    } else if (errorType) {
        body = (
            <div className="verify-page">
                <div className="verify-header">
                    <div className="verify-logo-section">
                        <div className="verify-logo-box">
                            <Lock size={24} />
                        </div>
                        <div className="verify-brand">
                            <h3>LGL CONSULTING</h3>
                            <p>OFFICIAL VERIFICATION PORTAL</p>
                        </div>
                    </div>
                </div>

                <main className="error-state-main">
                    <div className="error-state-card">
                        <div className={`error-state-icon-wrap ${errorType === 'network' ? 'network' : ''}`}>
                            {errorType === 'network' ? <WifiOff size={36} /> : <ShieldAlert size={36} />}
                        </div>

                        {errorType === 'network' ? (
                            <>
                                <h1 className="error-state-title">Connection Problem</h1>
                                <p className="error-state-desc">
                                    We couldn't reach the verification registry just now. This is usually a temporary
                                    network issue rather than a problem with the certificate itself.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="error-state-title">Certificate Not Found</h1>
                                <p className="error-state-desc">
                                    We couldn't find a certificate matching this code. It may have been typed
                                    incorrectly, or the record may not exist in our registry.
                                </p>
                            </>
                        )}

                        <div className="error-state-code-pill">
                            <code>{uuid}</code>
                        </div>

                        <div className="error-state-actions">
                            {errorType === 'network' && (
                                <button type="button" className="error-btn-primary" onClick={verify}>
                                    <RefreshCw size={16} /> Try Again
                                </button>
                            )}
                            <Link to="/" className="error-btn-secondary">
                                <ArrowRight size={16} /> Back to Platform
                            </Link>
                        </div>

                        <form className="lookup-form" onSubmit={handleLookupSubmit}>
                            <label htmlFor="lookup-code">Have a different certificate code?</label>
                            <div className="lookup-form-row">
                                <SearchCheck size={16} className="lookup-form-icon" />
                                <input
                                    id="lookup-code"
                                    type="text"
                                    placeholder="Enter certificate code"
                                    value={lookupCode}
                                    onChange={(e) => setLookupCode(e.target.value)}
                                    autoCapitalize="characters"
                                />
                                <button type="submit" disabled={!lookupCode.trim()}>Verify</button>
                            </div>
                        </form>
                    </div>
                </main>

                <footer className="verify-footer">
                    <p>© 2026 LGL Consulting Secure Registry Authority</p>
                </footer>
            </div>
        );
    } else {
        body = (
            <div className="verify-page">
                <div className="verify-header">
                    <div className="verify-logo-section">
                        <div className="verify-logo-box">
                            <Lock size={24} />
                        </div>
                        <div className="verify-brand">
                            <h3>LGL CONSULTING</h3>
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
                                    {certificate?.certificate_path ? (
                                        <img
                                            src={certificate.certificate_path}
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
                                    CREDENTIAL<br />
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
                                        <span>{certificate?.issued_by || 'LGL CONSULTING'}</span>
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
                    <p>© 2026 LGL Consulting Secure Registry Authority</p>
                </footer>

                {/* Modal */}
                {previewOpen && (
                    <div className="preview-modal" onClick={() => setPreviewOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="close-modal" onClick={() => setPreviewOpen(false)}><X size={32} /></button>
                            <img src={certificate?.certificate_path} alt="HD Preview" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            {body}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&family=Space+Grotesk:wght@300;700&display=swap');

                .verify-page {
                    min-height: 100vh;
                    background: var(--index-bg-color);
                    font-family: 'Outfit', sans-serif;
                    color: var(--index-text-heading);
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

                .verify-logo-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .verify-logo-box {
                    background: var(--index-primary-color);
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px color-mix(in srgb, var(--index-primary-color) 15%, transparent);
                }

                .verify-brand h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 900;
                    letter-spacing: -1px;
                    color: var(--index-primary-color);
                }

                .verify-brand p {
                    margin: 0;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: var(--index-text-faint);
                    text-transform: uppercase;
                }

                .verify-status-badge {
                    background: var(--index-card-bg);
                    color: var(--index-text-heading);
                    backdrop-filter: blur(10px);
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid var(--index-border-color);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--lgl-success);
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
                    background: var(--index-card-bg);
                    padding: 15px;
                    border-radius: 50px;
                    box-shadow: 0 40px 80px -20px color-mix(in srgb, var(--index-primary-color) 15%, transparent);
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .certificate-inner {
                    aspect-ratio: 1.414/1;
                    background: var(--index-hover-bg);
                    border-radius: 35px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid var(--index-border-color);
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
                    background: var(--lgl-warning);
                    color: white;
                    border-radius: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 15px 30px color-mix(in srgb, var(--lgl-warning) 30%, transparent);
                    border: 6px solid white;
                    transform: rotate(-10deg);
                }

                .info-card {
                    background: var(--index-primary-color);
                    color: white;
                    padding: 50px;
                    border-radius: 60px;
                    box-shadow: 0 30px 60px color-mix(in srgb, var(--index-primary-color) 20%, transparent);
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

                .gold { color: var(--lgl-warning); }

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
                    color: var(--lgl-warning);
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
                    background: var(--index-card-bg);
                    padding: 30px;
                    border-radius: 40px;
                    border: 1px solid var(--index-border-color);
                }

                .action-buttons {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .btn-primary {
                    flex: 1;
                    background: var(--index-primary-color);
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

                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 20px color-mix(in srgb, var(--index-primary-color) 20%, transparent); }

                .btn-secondary {
                    width: 65px;
                    background: var(--index-hover-bg);
                    border: 1px solid var(--index-border-color);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--index-text-secondary);
                }

                .trust-note {
                    margin: 0;
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--index-text-faint);
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
                    color: var(--index-text-faint);
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
                    background: var(--lgl-charcoal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-family: 'Space Grotesk', sans-serif;
                }

                .verify-spinner {
                    color: var(--lgl-warning);
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                .verify-loader-text { font-weight: 700; font-size: 1.5rem; letter-spacing: 5px; margin: 0; }
                .verify-loader-sub { font-size: 0.7rem; color: var(--lgl-gray-mid); letter-spacing: 3px; font-weight: 700; }

                /* Error / Not-Found State */
                .error-state-main {
                    max-width: 560px;
                    margin: 0 auto;
                }

                .error-state-card {
                    background: var(--index-card-bg);
                    border-radius: 40px;
                    padding: 56px 40px;
                    text-align: center;
                    border-top: 6px solid var(--lgl-error);
                    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.08);
                }

                .error-state-icon-wrap {
                    width: 84px;
                    height: 84px;
                    border-radius: 28px;
                    background: color-mix(in srgb, var(--lgl-error) 10%, transparent);
                    color: var(--lgl-error);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 28px;
                }

                .error-state-icon-wrap.network {
                    background: color-mix(in srgb, var(--lgl-warning) 12%, transparent);
                    color: var(--lgl-warning);
                }

                .error-state-title {
                    font-size: 1.75rem;
                    font-weight: 900;
                    letter-spacing: -1px;
                    margin: 0 0 14px;
                    color: var(--index-text-heading);
                }

                .error-state-desc {
                    font-size: 0.95rem;
                    font-weight: 500;
                    line-height: 1.6;
                    color: var(--index-text-secondary);
                    margin: 0 0 24px;
                }

                .error-state-code-pill {
                    display: inline-block;
                    background: var(--index-hover-bg);
                    border: 1px solid var(--index-border-color);
                    border-radius: 100px;
                    padding: 10px 24px;
                    margin-bottom: 32px;
                }

                .error-state-code-pill code {
                    font-size: 0.85rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: var(--index-text-heading);
                }

                .error-state-actions {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 36px;
                }

                .error-btn-primary,
                .error-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    padding: 14px 26px;
                    border-radius: 16px;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .error-btn-primary {
                    background: var(--index-primary-color);
                    color: white;
                    box-shadow: 0 10px 20px color-mix(in srgb, var(--index-primary-color) 25%, transparent);
                }

                .error-btn-secondary {
                    background: var(--index-hover-bg);
                    color: var(--index-text-heading);
                    border: 1px solid var(--index-border-color);
                }

                .error-btn-primary:hover,
                .error-btn-secondary:hover {
                    transform: translateY(-2px);
                }

                .lookup-form {
                    border-top: 1px solid var(--index-border-color);
                    padding-top: 28px;
                    text-align: left;
                }

                .lookup-form label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--index-text-faint);
                    margin-bottom: 12px;
                }

                .lookup-form-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--index-hover-bg);
                    border: 1.5px solid var(--index-border-color);
                    border-radius: 16px;
                    padding: 6px 6px 6px 16px;
                }

                .lookup-form-row:focus-within {
                    border-color: var(--index-primary-color);
                }

                .lookup-form-icon {
                    color: var(--index-text-faint);
                    flex-shrink: 0;
                }

                .lookup-form-row input {
                    flex: 1;
                    min-width: 0;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--index-text-heading);
                    padding: 10px 0;
                }

                .lookup-form-row input::placeholder {
                    text-transform: none;
                    letter-spacing: normal;
                    font-weight: 500;
                    color: var(--index-text-faint);
                }

                .lookup-form-row button {
                    flex-shrink: 0;
                    background: var(--index-primary-color);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 10px 20px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }

                .lookup-form-row button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .verify-page {
                        padding: 20px 12px;
                    }
                    .verify-header {
                        margin-bottom: 30px;
                    }
                    .verify-grid {
                        gap: 20px;
                    }
                    .certificate-frame {
                        padding: 10px;
                        border-radius: 24px;
                    }
                    .certificate-inner {
                        border-radius: 16px;
                    }
                    .seal-badge {
                        width: 70px;
                        height: 70px;
                        border-radius: 20px;
                        border: 4px solid white;
                        top: -15px;
                        left: -15px;
                    }
                    .seal-badge svg {
                        width: 28px !important;
                        height: 28px !important;
                    }
                    .info-card {
                        padding: 30px 20px;
                        border-radius: 28px;
                    }
                    .credential-title {
                        font-size: 2.2rem;
                        letter-spacing: -1px;
                    }
                    .name-val {
                        font-size: 1.5rem;
                    }
                    .course-val {
                        font-size: 1.1rem;
                    }
                    .error-state-card {
                        padding: 40px 24px;
                        border-radius: 28px;
                    }
                    .error-state-actions {
                        flex-direction: column;
                    }
                    .error-btn-primary,
                    .error-btn-secondary {
                        width: 100%;
                        justify-content: center;
                    }
                    .close-modal {
                        top: 15px;
                        right: 15px;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 50%;
                        padding: 4px;
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .info-metrics {
                        flex-direction: column;
                        gap: 15px;
                    }
                    .action-buttons {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .btn-secondary {
                        width: 100%;
                        padding: 16px;
                        border-radius: 20px;
                        height: 56px;
                    }
                    .btn-primary {
                        padding: 16px;
                    }
                }
            `}</style>
        </>
    );
};

export default CertificateVerification;
