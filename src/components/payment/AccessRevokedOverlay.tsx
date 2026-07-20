import React, { useState } from 'react';
import { Lock, ShieldAlert, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import type { PaymentInfo } from '../../utils/paymentUtils';
import { toast } from 'react-hot-toast';

interface AccessRevokedOverlayProps {
    paymentInfo: PaymentInfo;
    children?: React.ReactNode;
}

export const AccessRevokedOverlay: React.FC<AccessRevokedOverlayProps> = ({ paymentInfo, children }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (paymentInfo.isFullyPaid || !paymentInfo.isExpired) {
        return <>{children}</>;
    }

    const handlePayBalance = async () => {
        setIsProcessing(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/stripe/create-balance-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount_cents: paymentInfo.remainingBalance * 100 })
            });

            const data = await res.json();

            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || 'Unable to initiate Stripe checkout');
            }
        } catch (err) {
            toast.error('Network error initiating payment');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative min-h-[380px] w-full rounded-3xl overflow-hidden bg-brand-charcoal text-white flex items-center justify-center p-6 sm:p-12 text-center border-2 border-red-500/40 shadow-2xl animate-in fade-in duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-brand-charcoal to-brand-charcoal pointer-events-none" />

            <div className="relative z-10 max-w-xl space-y-6">
                <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30 shadow-inner">
                    <Lock size={40} />
                </div>

                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <ShieldAlert size={12} /> Access Suspended
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Access Revoked Due to Expired Payment</h2>
                    <p className="text-sm font-medium text-white/70 leading-relaxed">
                        Your payment deadline for <span className="font-bold text-white">{paymentInfo.courseTitle}</span> has expired. Lessons, videos, quizzes, and course materials are locked until your remaining tuition balance is settled.
                    </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs font-bold text-white/80">
                    <span>Remaining Balance Due:</span>
                    <span className="text-xl font-black text-red-400">${paymentInfo.remainingBalance}</span>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handlePayBalance}
                        disabled={isProcessing}
                        className="w-full h-16 bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-emerald/30 hover:scale-[1.02] active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <><Loader2 size={18} className="animate-spin" /> Connecting Stripe Checkout...</>
                        ) : (
                            <><CreditCard size={18} /> Pay Remaining Balance (${paymentInfo.remainingBalance}) & Restore Access <ArrowRight size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
