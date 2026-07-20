import React, { useState, useEffect, useRef } from 'react';
import { Shield, Mail, ArrowRight, CheckCircle2, Lock, Copy, Download, RefreshCw, X, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user, toggleTwoFactor } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [timer, setTimer] = useState<number>(0);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [demoCode] = useState<string>('123456');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStep(1);
            setOtp(['', '', '', '', '', '']);
            setTimer(0);
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSendCode = async () => {
        setIsSendingCode(true);
        try {
            const res = await fetch(`${API_URL}/2fa/send-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: user?.email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || `Verification code sent to ${user?.email}`);
                setTimer(60);
                setStep(2);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } else {
                toast.error(data.message || 'Failed to send verification code');
            }
        } catch (err) {
            toast.error('Network error. Unable to send verification code.');
        } finally {
            setIsSendingCode(false);
        }
    };

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

    const generateRecoveryCodes = () => {
        const codes: string[] = [];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 8; i++) {
            let part1 = '';
            let part2 = '';
            for (let j = 0; j < 4; j++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
            for (let j = 0; j < 4; j++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
            codes.push(`${part1}-${part2}`);
        }
        return codes;
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = otp.join('');
        if (fullCode.length !== 6) {
            toast.error('Please enter the full 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await fetch(`${API_URL}/2fa/enable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: fullCode })
            });

            const data = await res.json();
            if (res.ok) {
                toggleTwoFactor(true);
                setRecoveryCodes(data.recovery_codes || generateRecoveryCodes());
                toast.success('Two-Factor Authentication Enabled!');
                setStep(3);
            } else {
                toast.error(data.message || 'Invalid verification code');
            }
        } catch (err) {
            toast.error('Network error while verifying code.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCopyCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopied(true);
        toast.success('Backup recovery codes copied to clipboard');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleDownloadCodes = () => {
        const element = document.createElement('a');
        const file = new Blob([`LAYOS LMS 2FA BACKUP RECOVERY CODES\nAccount: ${user?.email}\nGenerated: ${new Date().toLocaleString()}\n\nKeep these single-use codes in a secure location:\n\n${recoveryCodes.join('\n')}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `layos-2fa-backup-codes.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Downloaded backup codes');
    };

    const handleFinish = () => {
        if (onSuccess) onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-brand-charcoal border border-brand-border rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 sm:p-8 bg-brand-beige/50 dark:bg-white/5 border-b border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-2xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Two-Factor Authentication</h3>
                            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Email Verification Layer</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex border-b border-brand-border bg-brand-beige/20 dark:bg-white/5">
                    <div className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest border-b-2 ${step === 1 ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5' : step > 1 ? 'border-brand-emerald/40 text-brand-emerald' : 'border-transparent text-brand-muted'}`}>
                        1. Identity Check
                    </div>
                    <div className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest border-b-2 ${step === 2 ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5' : step > 2 ? 'border-brand-emerald/40 text-brand-emerald' : 'border-transparent text-brand-muted'}`}>
                        2. Verify Code
                    </div>
                    <div className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest border-b-2 ${step === 3 ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5' : 'border-transparent text-brand-muted'}`}>
                        3. Recovery Keys
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8">
                    {/* STEP 1: Introduction & Send Code */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-2xl flex items-start gap-4">
                                <Mail size={24} className="text-brand-emerald shrink-0 mt-0.5" />
                                <div className="space-y-1 text-left">
                                    <h4 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-wider">Email OTP Dispatch</h4>
                                    <p className="text-xs text-brand-muted font-medium leading-relaxed">
                                        We will issue a 6-digit one-time security token to <span className="font-bold text-brand-charcoal dark:text-white">{user?.email}</span> whenever you authenticate on a new device.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs font-medium text-brand-muted">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-brand-emerald shrink-0" />
                                    <span>Prevents unauthorized logins even if password is compromised</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-brand-emerald shrink-0" />
                                    <span>Instant email delivery via secure SMTP stream</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-brand-emerald shrink-0" />
                                    <span>Includes emergency backup recovery codes</span>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 h-12 rounded-xl text-xs font-black uppercase tracking-wider text-brand-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={isSendingCode}
                                    className="px-8 h-12 bg-brand-emerald text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSendingCode ? (
                                        <><Loader2 size={16} className="animate-spin" /> Dispatching...</>
                                    ) : (
                                        <><Mail size={16} /> Send Code <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Enter OTP Code */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Enter Verification Code</h4>
                                <p className="text-xs text-brand-muted font-medium">
                                    A 6-digit code was sent to <span className="font-bold text-brand-charcoal dark:text-white">{user?.email}</span>
                                </p>
                            </div>

                            {/* OTP Input Boxes */}
                            <div className="flex justify-center gap-2 sm:gap-3 my-6">
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
                                        className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal rounded-xl transition-all outline-none text-brand-charcoal dark:text-white"
                                    />
                                ))}
                            </div>

                            {/* Resend Timer */}
                            <div className="flex items-center justify-between text-xs font-bold text-brand-muted pt-2 border-t border-brand-border">
                                <span>Didn't receive the email?</span>
                                {timer > 0 ? (
                                    <span className="text-brand-emerald flex items-center gap-1 font-mono">
                                        Resend in {timer}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={isSendingCode}
                                        className="text-brand-emerald hover:underline font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                                    >
                                        <RefreshCw size={14} className={isSendingCode ? 'animate-spin' : ''} /> Resend Code
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 h-12 rounded-xl text-xs font-black uppercase tracking-wider text-brand-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isVerifying || otp.join('').length !== 6}
                                    className="px-8 h-12 bg-brand-emerald text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isVerifying ? (
                                        <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                                    ) : (
                                        <><Lock size={16} /> Verify & Activate</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: Success & Recovery Codes */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">2FA Email Security Active!</h4>
                                <p className="text-xs text-brand-muted font-medium max-w-sm mx-auto">
                                    Save your emergency recovery codes below. If you lose access to your email, these single-use codes can be used to log in.
                                </p>
                            </div>

                            {/* Recovery Codes Grid */}
                            <div className="bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-3 text-[10px] font-black text-brand-muted uppercase tracking-widest border-b border-brand-border/60 pb-2">
                                    <span className="flex items-center gap-1.5"><KeyRound size={14} className="text-brand-emerald" /> Backup Recovery Codes</span>
                                    <span>Single Use Only</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold text-brand-charcoal dark:text-white">
                                    {recoveryCodes.map((code, idx) => (
                                        <div key={idx} className="p-2 bg-white dark:bg-black/30 border border-brand-border/50 rounded-lg text-center tracking-wider">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopyCodes}
                                    className="flex-1 h-12 bg-brand-beige dark:bg-white/10 hover:bg-brand-beige/80 text-brand-charcoal dark:text-white rounded-xl text-xs font-black uppercase tracking-wider border border-brand-border transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Copy size={16} /> {copied ? 'Copied!' : 'Copy Codes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadCodes}
                                    className="flex-1 h-12 bg-brand-beige dark:bg-white/10 hover:bg-brand-beige/80 text-brand-charcoal dark:text-white rounded-xl text-xs font-black uppercase tracking-wider border border-brand-border transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Download size={16} /> Download (.txt)
                                </button>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleFinish}
                                    className="w-full h-14 bg-brand-emerald text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-emerald/20 hover:scale-[1.02] active:scale-95 transition-all border-none cursor-pointer"
                                >
                                    Done & Return to Settings
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
