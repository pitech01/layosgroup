import React, { useState, useEffect } from 'react';
import { GlobeLock, Smartphone, RotateCcw, Monitor } from 'lucide-react';

/**
 * 🛡️ SecurityGuard System
 * - Desktop Only Enforcement: Blocks Mobile/Tablet access
 * - VPN/Proxy Shield: Blocks high-risk IPs using proxycheck.io
 */
const SecurityGuard = ({ children }: { children: React.ReactNode }) => {
    const [security, setSecurity] = useState<{
        isChecking: boolean;
        error: 'vpn' | 'mobile' | null;
    }>({ isChecking: true, error: null });

    useEffect(() => {
        const performSecurityChecks = async () => {
            // 1. 💻 Desktop Only Rule (Checks UA and Width)
            const ua = navigator.userAgent;
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            const isTabletUA = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
            const isSmallScreen = window.innerWidth <= 1024; 

            if (isMobileUA || isTabletUA || isSmallScreen) {
                setSecurity({ isChecking: false, error: 'mobile' });
                return;
            }

            // 2. 🚫 VPN / Proxy Shield (Frontend Detection Layer)
            try {
                // proxycheck.io public lookup (free tier, JSONP/CORS compatible)
                const res = await fetch('https://proxycheck.io/v2/?vpn=1&asn=1&time=1');
                const data = await res.json();
                
                // If current visitor IP results in proxy === 'yes', it's a VPN, Proxy, or Tor
                if (data && data.proxy === 'yes') {
                    setSecurity({ isChecking: false, error: 'vpn' });
                    return;
                }
            } catch (err) {
                // Note: If blocked by browser (adblockers), the Laravel backend middleware 
                // will finalize the enforcement on the first sensitive API call.
            }

            setSecurity({ isChecking: false, error: null });
        };

        performSecurityChecks();
    }, []);

    const BlockingUI = ({ type }: { type: 'vpn' | 'mobile' }) => (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 999999
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .blocking-card { animation: fadeIn 0.4s ease-out; }
            `}</style>
            
            <div className="blocking-card" style={{
                maxWidth: '480px',
                width: '100%',
                background: 'white',
                padding: '3.5rem 3rem',
                borderRadius: '32px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: type === 'vpn' ? '#fff1f2' : '#f0f9ff',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2.5rem auto'
                }}>
                    {type === 'vpn' ? (
                        <GlobeLock size={42} color="#e11d48" />
                    ) : (
                        <Smartphone size={42} color="#0369a1" />
                    )}
                </div>

                <h2 style={{
                    fontSize: '1.85rem',
                    fontWeight: 950,
                    color: '#0f172a',
                    marginBottom: '1rem',
                    letterSpacing: '-0.04em'
                }}>
                    {type === 'vpn' ? 'Access Restricted 🚫' : 'Desktop Only Platform 💻'}
                </h2>

                <p style={{
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '3rem'
                }}>
                    {type === 'vpn' 
                        ? 'Please disconnect from any VPN or proxy service to use this platform. This is a secure, strictly monitored area.' 
                        : 'This system is only accessible on a desktop or laptop device to ensure the highest educational standards and platform security.'}
                </p>

                {type === 'vpn' ? (
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            width: '100%',
                            height: '60px',
                            background: '#1a4d3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '18px',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 15px -3px rgba(26, 77, 62, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(26, 77, 62, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(26, 77, 62, 0.2)';
                        }}
                    >
                        <RotateCcw size={20} /> Retry Connection
                    </button>
                ) : (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        background: '#f8fafc',
                        border: '1.5px solid #f1f5f9',
                        borderRadius: '100px',
                        color: '#475569',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                    }}>
                        <Monitor size={18} /> Switch to Laptop / PC
                    </div>
                )}
            </div>
        </div>
    );

    // Initial Loading State (Silent Loader)
    if (security.isChecking) return (
        <div style={{ height: '100vh', width: '100vw', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #e2e8f0', 
                borderTopColor: '#1a4d3e', 
                borderRadius: '50%', 
                animation: 'sec-spin 1s linear infinite' 
            }}></div>
            <style>{`@keyframes sec-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // Block the App Loop if a security violation exists
    if (security.error) return <BlockingUI type={security.error} />;

    // Proceed to Platform if all clear
    return <>{children}</>;
};

export default SecurityGuard;
