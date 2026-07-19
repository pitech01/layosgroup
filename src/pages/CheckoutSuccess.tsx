import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface StudentData {
  name: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function CheckoutSuccess() {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Get session_id from URL query string
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing Stripe payment session reference.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${baseUrl}/stripe/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStudent(data.student);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Payment verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage('Unable to connect to backend server. Please verify your connection.');
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText('password123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-page-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
        .success-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          color: #f1f5f9;
        }

        .success-card {
          width: 100%;
          max-width: 620px;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          padding: 3rem 2.25rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .success-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(52, 121, 127, 0.4) 0%, transparent 70%);
          filter: blur(20px);
          pointer-events: none;
        }

        /* ─── State layouts ─── */
        .state-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem 0;
        }

        .spinner-glow {
          color: #5eead4;
          animation: spin 1s linear infinite;
          filter: drop-shadow(0 0 8px rgba(94, 234, 212, 0.5));
        }

        .loading-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.5px;
        }

        .loading-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          max-width: 320px;
          margin: 0 auto;
        }

        /* ─── Success Layout ─── */
        .check-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.25));
        }

        .success-title {
          font-size: 2.25rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -1px;
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }

        .success-desc {
          font-size: 0.98rem;
          color: #cbd5e1;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        /* Credentials Box */
        .credential-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .credential-header {
          font-size: 0.8rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .credential-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .credential-field:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .field-label {
          color: #94a3b8;
          font-size: 0.88rem;
        }

        .field-value {
          font-family: monospace;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .password-value-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .copy-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        /* Next Steps Box */
        .info-notice {
          display: flex;
          gap: 0.75rem;
          background: rgba(52, 121, 127, 0.1);
          border: 1px solid rgba(52, 121, 127, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: left;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #cbd5e1;
          margin-bottom: 2.25rem;
        }

        .info-notice-icon {
          color: #5eead4;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Actions */
        .action-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 480px) {
          .action-row {
            flex-direction: row;
          }
        }

        .btn-lms-login {
          flex: 1;
          background: linear-gradient(135deg, #34797f 0%, #0d9488 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.9rem 1.5rem;
          font-weight: 750;
          font-size: 0.98rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(13, 148, 136, 0.25);
          text-decoration: none;
        }

        .btn-lms-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
          background: linear-gradient(135deg, #3c8c93 0%, #0f9f93 100%);
        }

        .btn-home-fallback {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          border-radius: 12px;
          padding: 0.9rem 1.5rem;
          font-weight: 700;
          font-size: 0.98rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-home-fallback:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Error state */
        .error-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.25));
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        `,
      }} />

      <div className="success-card">
        {status === 'loading' && (
          <div className="state-loader">
            <Loader2 className="spinner-glow" size={48} />
            <div>
              <h3 className="loading-title">Verifying Payment Status</h3>
              <p className="loading-subtitle">
                Please wait a moment while we authenticate your transaction and provision your student file...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="error-icon-wrapper">
              <AlertCircle size={40} />
            </div>
            <h2 className="success-title" style={{ fontSize: '1.8rem' }}>Verification Timeout</h2>
            <p className="success-desc">
              {errorMessage || 'We encountered an error while verifying your payment session. Please check with support.'}
            </p>

            <div className="action-row">
              <a href="https://layosgroupllc.com/contact" className="btn-lms-login">
                Contact Support
              </a>
              <a href="https://layosgroupllc.com/" className="btn-home-fallback">
                Return to Home
              </a>
            </div>
          </div>
        )}

        {status === 'success' && student && (
          <div>
            <div className="check-icon-wrapper">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="success-title">Enrollment Approved!</h2>
            <p className="success-desc">
              Thank you, <strong>{student.first_name}</strong>! Your transaction was approved and your student dashboard access details are initialized.
            </p>

            <div className="credential-box">
              <div className="credential-header">
                <ShieldCheck size={16} style={{ color: '#5eead4' }} /> Learning Portal Credentials
              </div>
              <div className="credential-field">
                <span className="field-label">Portal Login Username</span>
                <span className="field-value">{student.email}</span>
              </div>
              <div className="credential-field">
                <span className="field-label">Default Access Password</span>
                <div className="password-value-wrap">
                  <span className="field-value">password123</span>
                  <button className="copy-btn" onClick={handleCopyPassword}>
                    {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="info-notice">
              <Info className="info-notice-icon" size={16} />
              <div>
                <strong>Next Step:</strong> Your class credentials are now live! We have sent a detailed onboarding welcome guide to <strong>{student.email}</strong>. Our instructors will manually update and load your respective courses onto your dashboard workspace shortly.
              </div>
            </div>

            <div className="action-row">
              <Link to="/login" className="btn-lms-login">
                Proceed to Learning Portal <ExternalLink size={16} />
              </Link>
              <a href="https://layosgroupllc.com/" className="btn-home-fallback">
                Return to Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
