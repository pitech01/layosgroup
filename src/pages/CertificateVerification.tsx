import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ShieldCheck, Download, ExternalLink, Calendar, User, GraduationCap, Loader2, BadgeCheck } from 'lucide-react';

interface Certificate {
    full_name: string;
    course_title: string;
    issued_at: string;
    certificate_uuid: string;
    issued_by: string;
}

const CertificateVerification = () => {
    const { uuid } = useParams();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`${API_URL}/certificates/verify/${uuid}`);
                setCertificate(res.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [uuid]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={64} />
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Verifying Credentials...</h2>
            <p className="text-slate-500 font-medium">Checking international certification records</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-12 text-center border-2 border-red-50">
                <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
                    <AlertCircle size={48} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Invalid Credential</h1>
                <p className="text-slate-500 font-medium leading-[1.6] mb-8">
                    We could not find a record matching this certificate ID. This credential may have been revoked or is not authentic.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-700 transition-colors">
                    Return to Platform
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 relative">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="p-12 relative">
                        {/* Status Badge */}
                        <div className="flex justify-center mb-10">
                            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-green-50 rounded-2xl border border-green-100">
                                <ShieldCheck className="text-green-600" size={20} />
                                <span className="text-green-700 font-black tracking-wide text-sm uppercase">Authentic Credential</span>
                            </div>
                        </div>

                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 leading-[1.1]">Certification Verified</h1>
                            <p className="text-slate-400 font-bold flex items-center justify-center gap-2">
                                ID: <span className="text-slate-600 font-mono text-sm tracking-wider uppercase select-all">{uuid?.slice(0, 18)}...</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <RecordRow label="Certified Professional" value={certificate?.full_name || ''} icon={<User size={20} />} active />
                            <RecordRow label="Course of Completion" value={certificate?.course_title || ''} icon={<GraduationCap size={20} />} />
                            <RecordRow label="Completion Date" value={new Date(certificate?.issued_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} icon={<Calendar size={20} />} />
                            <RecordRow label="Issuer" value={certificate?.issued_by || 'Layos Group LLC'} icon={<BadgeCheck size={20} />} />
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <a 
                                href={`${API_URL}/certificates/download/${uuid}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-slate-900 text-white rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-slate-800 transition-all font-bold active:scale-95"
                            >
                                <Download size={22} />
                                <span className="text-xs uppercase tracking-widest text-slate-400">Download JPEG</span>
                            </a>
                            <Link 
                                to="/" 
                                className="bg-blue-600 text-white rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 active:scale-95"
                            >
                                <ExternalLink size={22} />
                                <span className="text-xs uppercase tracking-widest text-blue-200">Our Courses</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Verify credentials securely at <span className="text-slate-600 font-black">Layos Group Academic Records</span></p>
                    <p className="text-[0.7rem] uppercase font-black tracking-widest mt-4 opacity-50">© 2026 GLOBAL CERTIFICATION REGISTRY</p>
                </div>
            </div>
        </div>
    );
};

interface RecordRowProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    active?: boolean;
}

const RecordRow = ({ label, value, icon, active }: RecordRowProps) => (
    <div className={`p-6 rounded-3xl border transition-all ${active ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${active ? 'bg-white text-blue-600' : 'bg-white text-slate-400'}`}>
                {icon}
            </div>
            <div>
                <span className="block text-[0.65rem] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</span>
                <span className={`block text-lg font-black tracking-tight leading-tight ${active ? 'text-blue-900' : 'text-slate-800'}`}>
                    {value}
                </span>
            </div>
        </div>
    </div>
);

export default CertificateVerification;
