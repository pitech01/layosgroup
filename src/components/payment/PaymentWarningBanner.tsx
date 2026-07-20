import React, { useState } from 'react';
import { AlertTriangle, Clock, CreditCard, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import type { PaymentInfo } from '../../utils/paymentUtils';
import { toast } from 'react-hot-toast';

interface PaymentWarningBannerProps {
    paymentInfo: PaymentInfo;
}

export const PaymentWarningBanner: React.FC<PaymentWarningBannerProps> = ({ paymentInfo }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (paymentInfo.isFullyPaid || paymentInfo.bannerLevel === 'none') {
        return null;
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

    const isExpired = paymentInfo.bannerLevel === 'expired';
    const isRed = paymentInfo.bannerLevel === 'red';
    const isOrange = paymentInfo.bannerLevel === 'orange';

    const bgClass = isExpired
        ? 'bg-red-600 text-white border-red-700'
        : isRed
        ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
        : isOrange
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-900 dark:text-yellow-200';

    const iconColor = isExpired ? 'text-white' : isRed ? 'text-red-500' : isOrange ? 'text-amber-500' : 'text-yellow-600';

    return (
        <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all animate-in slide-in-from-top duration-300 ${bgClass}`}>
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`p-3 rounded-xl shrink-0 ${isExpired ? 'bg-white/20' : 'bg-white/60 dark:bg-black/20'}`}>
                    {isExpired ? (
                        <ShieldAlert size={22} className={iconColor} />
                    ) : isRed ? (
                        <AlertTriangle size={22} className={iconColor} />
                    ) : (
                        <Clock size={22} className={iconColor} />
                    )}
                </div>

                <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs uppercase tracking-widest">
                            {isExpired
                                ? 'Payment Deadline Expired'
                                : isRed
                                ? 'Critical Payment Notice'
                                : isOrange
                                ? 'Approaching Deadline'
                                : 'Tuition Balance Reminder'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/30 uppercase tracking-wider">
                            50% Balance Remaining: ${paymentInfo.remainingBalance}
                        </span>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed opacity-90">
                        {isExpired ? (
                            'Your access to learning modules has been revoked. Pay your remaining balance to immediately restore full access.'
                        ) : isRed ? (
                            `CRITICAL: Less than 48 hours remaining! Access will be revoked if payment is not completed before ${paymentInfo.deadlineDate?.toLocaleDateString()}.`
                        ) : isOrange ? (
                            `Your payment deadline is approaching. Complete your remaining balance before ${paymentInfo.deadlineDate?.toLocaleDateString()}.`
                        ) : (
                            `You have ${paymentInfo.daysRemaining} days and ${paymentInfo.hoursRemaining} hours remaining to complete your payment.`
                        )}
                    </p>
                </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex justify-end">
                <button
                    type="button"
                    onClick={handlePayBalance}
                    disabled={isProcessing}
                    className={`w-full md:w-auto px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 ${
                        isExpired
                            ? 'bg-white text-red-600 hover:bg-slate-100 shadow-black/20'
                            : 'bg-brand-emerald text-white hover:bg-emerald-600 shadow-brand-emerald/20'
                    }`}
                >
                    {isProcessing ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing Stripe...</>
                    ) : (
                        <><CreditCard size={16} /> Pay Remaining Balance (${paymentInfo.remainingBalance}) <ArrowRight size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};
