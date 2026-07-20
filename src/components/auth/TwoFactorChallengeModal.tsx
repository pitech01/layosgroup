import React, { useState, useEffect, useRef } from 'react';
import { Shield, Mail, Lock, RefreshCw, X, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TwoFactorChallengeModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
    onVerify: (code: string) => Promise<void>;
    onResendCode?: () => Promise<void>;
}

export const TwoFactorChallengeModal: React.FC<TwoFactorChallengeModalProps> = ({
    isOpen,
    email,
    onClose,
    onVerify,
    onResendCode
}) => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState<number>(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: any;
        if (timer > 0 && isOpen) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setTimer(60);
            setTimeout(() => inputRefs.current[0]?.focus(), 150);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
            const newOtp = [...otp];
            pasted.forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            const nextFocus = Math.min(pasted.length, 5);
            inputRefs.current[nextFocus]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            toast.error('Please enter the 6-digit security code');
            return;
        }
        setIsVerifying(true);
        try {
            await onVerify(code);
        } catch (err: any) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            if (onResendCode) {
                await onResendCode();
            } else {
                toast.success(`Security code resent to ${email}`);
            }
            setTimer(60);
        } catch (err) {
            toast.error('Failed to resend security code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-brand-charcoal border border-brand-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-6 bg-brand-beige/50 dark:bg-white/5 border-b border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-2xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Security Check Required</h3>
                            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Two-Factor Authentication</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-brand-beige dark:bg-white/10 rounded-2xl mb-1">
                            <Mail size={22} className="text-brand-emerald" />
                        </div>
                        <h4 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Check Your Inbox</h4>
                        <p className="text-xs text-brand-muted font-medium leading-relaxed">
                            Enter the 6-digit security code sent to <br />
                            <span className="font-bold text-brand-charcoal dark:text-white">{email}</span>
                        </p>
                    </div>

                    {/* OTP Inputs */}
                    <div className="flex justify-center gap-2 my-4">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl font-black bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal rounded-xl transition-all outline-none text-brand-charcoal dark:text-white"
                            />
                        ))}
                    </div>

                    {/* Resend Link */}
                    <div className="flex items-center justify-between text-xs font-bold text-brand-muted pt-2 border-t border-brand-border">
                        <span>Didn't receive email?</span>
                        {timer > 0 ? (
                            <span className="text-brand-emerald font-mono">Resend in {timer}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-brand-emerald hover:underline font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                            >
                                <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} /> Resend Code
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isVerifying || otp.join('').length !== 6}
                            className="w-full h-14 bg-brand-emerald text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-emerald/20 hover:scale-[1.02] active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <><Loader2 size={18} className="animate-spin" /> Verifying Access...</>
                            ) : (
                                <><Lock size={18} /> Authenticate Session <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
