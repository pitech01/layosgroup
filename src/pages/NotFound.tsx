import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Map } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }

                @keyframes pulse-slow {
                    0% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.1); opacity: 0.15; }
                    100% { transform: scale(1); opacity: 0.1; }
                }

                .not-found-container {
                    text-align: center;
                    z-index: 10;
                    max-width: 600px;
                }

                .error-code {
                    font-size: clamp(8rem, 20vw, 12rem);
                    font-weight: 900;
                    line-height: 1;
                    background: linear-gradient(135deg, #1a4d3e, #2d7a63);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0;
                    position: relative;
                    letter-spacing: -0.05em;
                }

                .decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: #1a4d3e;
                    filter: blur(80px);
                    z-index: -1;
                    animation: pulse-slow 8s infinite ease-in-out;
                }

                .btn-not-found {
                    padding: 1rem 2rem;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    border: none;
                }

                .btn-primary-nf {
                    background: #1a4d3e;
                    color: white;
                    box-shadow: 0 10px 20px rgba(26, 77, 62, 0.2);
                }

                .btn-primary-nf:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(26, 77, 62, 0.3);
                    background: #153a2f;
                }

                .btn-secondary-nf {
                    background: white;
                    color: #1a4d3e;
                    border: 2px solid #e2e8f0;
                }

                .btn-secondary-nf:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-3px);
                }

                .icon-container {
                    margin-bottom: -2rem;
                    animation: float 6s infinite ease-in-out;
                    display: inline-block;
                    color: #1a4d3e;
                    opacity: 0.8;
                }
            `}</style>

            {/* Decorative Background Elements */}
            <div className="decoration-circle" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
            <div className="decoration-circle" style={{ width: '300px', height: '300px', bottom: '-50px', left: '-50px', background: '#2d7a63' }}></div>

            <div className="not-found-container animate-fade-in-up">
                <div className="icon-container">
                    <img
                        src="/logo.png"
                        alt="LayosGroup Logo"
                        style={{ height: '60px', width: 'auto' }}
                    />
                </div>

                <h1 className="error-code">404</h1>

                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}>
                    Lost in the curriculum?
                </h2>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '3rem',
                    lineHeight: 1.6
                }}>
                    The page you are looking for might have been moved, deleted, or never existed in the first place. Let's get you back on track.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(-1)} className="btn-not-found btn-secondary-nf">
                        <ArrowLeft size={20} /> Go Back
                    </button>
                    <button onClick={() => navigate('/login')} className="btn-not-found btn-primary-nf">
                        <Home size={20} /> Return Home
                    </button>
                </div>

                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '3rem' }}>
                    <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <Map size={24} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Sitemap</div>
                    </div>
                    <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <Search size={24} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Search</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
