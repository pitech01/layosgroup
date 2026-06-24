import React from 'react';

/**
 * 🛡️ SecurityGuard System
 * - VPN/Proxy Shield: Handled server-side via CheckVpn middleware
 *
 * Note: proxycheck.io is a server-to-server API and cannot be called
 * directly from the browser (CORS blocked). VPN detection is
 * delegated entirely to the backend CheckVpn middleware.
 */
const SecurityGuard = ({ children }: { children: React.ReactNode }) => {
    // Proceed to Platform — VPN/security checks are handled by the backend
    return <>{children}</>;
};

export default SecurityGuard;
