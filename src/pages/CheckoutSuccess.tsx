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
  Receipt,
} from 'lucide-react';

interface StudentData {
  id?: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  payment_plan?: string;
  payment_method?: string;
  payment_status?: string;
  education_level?: string;
  referral_name?: string;
  referral_email?: string;
  address_line1?: string;
  city?: string;
  created_at?: string;
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
          background: var(--index-bg-color);
          background-image: radial-gradient(color-mix(in srgb, var(--index-primary-color) 3%, transparent) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          color: var(--index-text-heading);
        }

        .success-card {
          width: 100%;
          max-width: 620px;
          background: var(--index-card-bg);
          border: 1px solid var(--index-border-color);
          border-radius: 24px;
          box-shadow: 0 20px 40px color-mix(in srgb, var(--lgl-charcoal) 5%, transparent);
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
          background: radial-gradient(circle, color-mix(in srgb, var(--index-primary-color) 8%, transparent) 0%, transparent 70%);
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
          color: var(--index-primary-color);
          animation: spin 1s linear infinite;
          filter: drop-shadow(0 0 8px color-mix(in srgb, var(--index-primary-color) 20%, transparent));
        }

        .loading-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--index-text-heading);
          letter-spacing: -0.5px;
        }

        .loading-subtitle {
          color: var(--index-text-secondary);
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
          background: color-mix(in srgb, var(--lgl-success) 10%, transparent);
          border: 2px solid color-mix(in srgb, var(--lgl-success) 20%, transparent);
          color: var(--lgl-success);
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px color-mix(in srgb, var(--lgl-success) 15%, transparent));
        }

        .success-title {
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--index-text-heading);
          letter-spacing: -1px;
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }

        .success-desc {
          font-size: 0.98rem;
          color: var(--index-text-secondary);
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        /* Credentials Box */
        .credential-box {
          background: var(--index-hover-bg);
          border: 1px solid var(--index-border-color);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .credential-header {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--index-text-secondary);
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
          border-bottom: 1px solid var(--index-border-color);
        }

        .credential-field:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .field-label {
          color: var(--index-text-secondary);
          font-size: 0.88rem;
        }

        .field-value {
          font-family: monospace;
          color: var(--index-text-heading);
          font-size: 0.95rem;
          font-weight: 700;
        }

        .password-value-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .copy-btn {
          background: var(--index-card-bg);
          border: 1px solid var(--index-border-color);
          color: var(--index-text-secondary);
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
          background: var(--index-hover-bg);
          color: var(--index-text-heading);
        }

        /* Next Steps Box */
        .info-notice {
          display: flex;
          gap: 0.75rem;
          background: color-mix(in srgb, var(--index-primary-color) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--index-primary-color) 15%, transparent);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: left;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--index-text-heading);
          margin-bottom: 2.25rem;
        }

        .info-notice-icon {
          color: var(--index-primary-color);
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
          background: linear-gradient(135deg, var(--index-primary-color) 0%, var(--index-primary-hover) 100%);
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
          box-shadow: 0 4px 15px color-mix(in srgb, var(--index-primary-hover) 25%, transparent);
          text-decoration: none;
        }

        .btn-lms-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px color-mix(in srgb, var(--index-primary-hover) 40%, transparent);
          background: linear-gradient(135deg, var(--index-primary-color) 0%, var(--index-primary-hover) 100%);
        }

        .btn-home-fallback {
          flex: 1;
          background: var(--index-card-bg);
          border: 1px solid var(--index-border-color);
          color: var(--index-text-secondary);
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
          background: var(--index-hover-bg);
          color: var(--index-text-heading);
        }

        /* Error state */
        .error-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--lgl-error) 10%, transparent);
          border: 2px solid color-mix(in srgb, var(--lgl-error) 20%, transparent);
          color: var(--lgl-error);
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px color-mix(in srgb, var(--lgl-error) 10%, transparent));
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .success-page-wrapper {
            padding: 1.5rem 0.75rem;
          }
          .success-card {
            padding: 2rem 1.25rem;
            border-radius: 20px;
          }
          .check-icon-wrapper, .error-icon-wrapper {
            width: 64px;
            height: 64px;
            margin-bottom: 1.25rem;
          }
          .check-icon-wrapper svg, .error-icon-wrapper svg {
            width: 32px;
            height: 32px;
          }
          .success-title {
            font-size: 1.65rem;
            margin-bottom: 0.5rem;
          }
          .success-desc {
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }
          .credential-box {
            padding: 1.15rem 1rem;
            margin-bottom: 1.5rem;
            border-radius: 14px;
          }
          .credential-field {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
            padding: 0.75rem 0;
          }
          .field-label {
            font-size: 0.8rem;
          }
          .field-value {
            font-size: 0.88rem;
            word-break: break-all;
            max-width: 100%;
          }
          .password-value-wrap {
            width: 100%;
            justify-content: space-between;
          }
          .info-notice {
            padding: 1rem;
            margin-bottom: 1.75rem;
            font-size: 0.82rem;
            border-radius: 10px;
          }
          .action-row {
            flex-direction: column;
            width: 100%;
          }
          .btn-lms-login, .btn-home-fallback {
            width: 100%;
            padding: 0.85rem 1.25rem;
            font-size: 0.92rem;
          }
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
                <ShieldCheck size={16} style={{ color: 'var(--lgl-cyan)' }} /> Learning Portal Credentials
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
                    {copied ? <Check size={13} style={{ color: 'var(--lgl-success)' }} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Receipt Summary Card */}
            <div className="receipt-display-box" style={{
              background: 'var(--index-hover-bg)',
              border: '1px solid var(--index-border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed var(--index-border-color)',
                paddingBottom: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: 'var(--index-text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Receipt size={17} style={{ color: 'var(--index-primary-color)' }} /> Official Payment Receipt
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                    Receipt #LAYOS-{String(student.id || 1).padStart(5, '0')}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 900,
                  color: 'var(--lgl-success)',
                  background: 'color-mix(in srgb, var(--lgl-success) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--lgl-success) 40%, transparent)',
                  padding: '4px 10px',
                  borderRadius: '99px',
                  textTransform: 'uppercase'
                }}>
                  APPROVED
                </span>
              </div>

              <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Billed Student</span>
                  <span style={{ color: 'var(--index-text-heading)', fontWeight: 700 }}>{student.first_name} {student.last_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Email Address</span>
                  <span style={{ color: 'var(--index-text-heading)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}>{student.email}</span>
                </div>
                {student.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Phone Number</span>
                    <span style={{ color: 'var(--index-text-heading)', fontWeight: 700 }}>{student.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Payment Plan</span>
                  <span style={{ color: 'var(--index-text-heading)', fontWeight: 700, textTransform: 'capitalize' }}>
                    {student.payment_plan ? student.payment_plan.replace('_', ' ') : 'Full Tuition'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Payment Method</span>
                  <span style={{ color: 'var(--index-text-heading)', fontWeight: 700 }}>Stripe Card</span>
                </div>
                {student.education_level && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Education Level</span>
                    <span style={{ color: 'var(--index-text-heading)', fontWeight: 700 }}>{student.education_level}</span>
                  </div>
                )}
                {(student.referral_name || student.referral_email) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--index-border-subtle)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Referred By</span>
                    <span style={{ color: 'var(--index-text-heading)', fontWeight: 700 }}>
                      {student.referral_name || 'Friend'} {student.referral_email ? `(${student.referral_email})` : ''}
                    </span>
                  </div>
                )}
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
