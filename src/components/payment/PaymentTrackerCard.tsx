import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Calendar, CheckCircle2, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { getPaymentInfo } from '../../utils/paymentUtils';
import type { PaymentInfo } from '../../utils/paymentUtils';
import { toast } from 'react-hot-toast';

interface PaymentTrackerCardProps {
    user: any;
    cohort: any;
    onPaymentSuccess?: () => void;
}

export const PaymentTrackerCard: React.FC<PaymentTrackerCardProps> = ({ user, cohort }) => {
    const [info, setInfo] = useState<PaymentInfo>(() => getPaymentInfo(user, cohort));
    const [isProcessing, setIsProcessing] = useState(false);

    // Live 1-second ticker update
    useEffect(() => {
        const timer = setInterval(() => {
            setInfo(getPaymentInfo(user, cohort));
        }, 1000);
        return () => clearInterval(timer);
    }, [user, cohort]);

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
                body: JSON.stringify({ amount_cents: info.remainingBalance * 100 })
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

    // HIDE CARD COMPLETELY WHEN INACTIVE OR FULLY PAID
    if (info.isFullyPaid || info.bannerLevel === 'none') {
        return null;
    }

    // 2. NO ASSIGNED COHORT STATE
    if (!info.hasCohort) {
        return (
            <div className="bg-white dark:bg-brand-charcoal rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
                        <CreditCard size={24} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Payment Tracker</h4>
                        <p className="text-xs text-brand-muted font-medium leading-relaxed">
                            You currently have no assigned cohort. Your 50% tuition payment countdown will activate once you are assigned to a cohort.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 3. COHORT HAS NOT STARTED YET STATE
    if (!info.hasStarted) {
        return (
            <div className="bg-white dark:bg-brand-charcoal rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Tuition Balance Tracker</h3>
                                <span className="px-3 py-0.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    50% Paid ($500 Remaining)
                                </span>
                            </div>
                            <p className="text-xs text-brand-muted font-medium mt-0.5">
                                Cohort: <span className="font-bold text-brand-charcoal dark:text-white">{info.cohortName}</span> ({info.courseType === 'foundation' ? 'Foundation - 7 Day Term' : 'Professional - 14 Day Term'})
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePayBalance}
                        disabled={isProcessing}
                        className="px-6 h-12 bg-brand-emerald text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><CreditCard size={16} /> Complete Payment (${info.remainingBalance})</>}
                    </button>
                </div>

                <div className="p-5 bg-brand-beige/40 dark:bg-white/5 border border-brand-border rounded-2xl flex items-center gap-4">
                    <Clock size={24} className="text-indigo-500 shrink-0" />
                    <p className="text-xs font-bold text-brand-charcoal dark:text-white leading-relaxed">
                        Your 50% tuition payment countdown will begin once your cohort starts on{' '}
                        <span className="text-brand-emerald font-black underline">{info.startDate?.toLocaleDateString()}</span>.
                    </p>
                </div>
            </div>
        );
    }

    // 4. EXPIRED PAYMENT STATE
    if (info.isExpired) {
        return (
            <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-8 border-2 border-red-700 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/20 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-white border border-white/30">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-black uppercase tracking-tight">Expired Payment - Access Revoked</h3>
                                <span className="px-3 py-1 bg-white text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Payment Overdue
                                </span>
                            </div>
                            <p className="text-xs font-medium opacity-90 leading-relaxed max-w-xl">
                                Your payment deadline has expired. Your access to the learning platform has been revoked. Please complete your remaining balance of <span className="font-black text-white underline">${info.remainingBalance}</span> to restore access.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePayBalance}
                        disabled={isProcessing}
                        className="w-full md:w-auto px-8 h-14 bg-white text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-100 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-3 shrink-0 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <><Loader2 size={18} className="animate-spin" /> Connecting Stripe...</>
                        ) : (
                            <><CreditCard size={18} /> Pay Remaining Balance (${info.remainingBalance}) <ArrowRight size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // 5. ACTIVE COUNTDOWN STATE (50% Paid, Start Date Reached)
    return (
        <div className="bg-white dark:bg-brand-charcoal rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-sm space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Tuition Balance Countdown</h3>
                            <span className="px-3 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                50% Paid (${info.remainingBalance} Due)
                            </span>
                        </div>
                        <p className="text-xs text-brand-muted font-medium mt-0.5">
                            Cohort: <span className="font-bold text-brand-charcoal dark:text-white">{info.cohortName}</span> • Course: <span className="font-bold text-brand-emerald">{info.courseTitle}</span>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handlePayBalance}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 h-12 bg-brand-emerald text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing Stripe...</>
                    ) : (
                        <><CreditCard size={16} /> Pay Remaining Balance (${info.remainingBalance}) <ArrowRight size={14} /></>
                    )}
                </button>
            </div>

            {/* Countdown Grid & Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Days */}
                <div className="p-4 bg-brand-beige/50 dark:bg-white/5 border border-brand-border/60 rounded-2xl text-center space-y-1">
                    <div className="text-3xl font-black text-brand-charcoal dark:text-white font-mono">{String(info.daysRemaining).padStart(2, '0')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Days</div>
                </div>
                {/* Hours */}
                <div className="p-4 bg-brand-beige/50 dark:bg-white/5 border border-brand-border/60 rounded-2xl text-center space-y-1">
                    <div className="text-3xl font-black text-brand-charcoal dark:text-white font-mono">{String(info.hoursRemaining).padStart(2, '0')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Hours</div>
                </div>
                {/* Minutes */}
                <div className="p-4 bg-brand-beige/50 dark:bg-white/5 border border-brand-border/60 rounded-2xl text-center space-y-1">
                    <div className="text-3xl font-black text-brand-charcoal dark:text-white font-mono">{String(info.minutesRemaining).padStart(2, '0')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Minutes</div>
                </div>
                {/* Seconds */}
                <div className="p-4 bg-brand-beige/50 dark:bg-white/5 border border-brand-border/60 rounded-2xl text-center space-y-1">
                    <div className="text-3xl font-black text-brand-emerald font-mono">{String(info.secondsRemaining).padStart(2, '0')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Seconds</div>
                </div>
            </div>

            {/* Details Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium text-brand-muted gap-2 pt-2 border-t border-brand-border/60">
                <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-emerald" /> Cohort Start: <strong className="text-brand-charcoal dark:text-white">{info.startDate?.toLocaleDateString()}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" /> Deadline ({info.durationDays} Days): <strong className="text-brand-charcoal dark:text-white">{info.deadlineDate?.toLocaleDateString()}</strong>
                </span>
            </div>
        </div>
    );
};
