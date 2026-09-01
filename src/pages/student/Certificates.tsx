import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ShieldCheck, Loader2, AlertCircle, Trophy } from 'lucide-react';

interface Certificate {
    id: number;
    certificate_uuid: string;
    course_id: number;
    course_title: string;
    full_name: string;
    certificate_path: string;
    issued_by: string;
    issued_at: string;
}

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/certificates`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to load certificates.');
                setCertificates(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load certificates.');
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, [API_URL]);

    const downloadCertificate = async (cert: Certificate) => {
        setDownloadingId(cert.id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/certificates/download/${cert.certificate_uuid}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate-${cert.certificate_uuid}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(`${API_URL}/certificates/download/${cert.certificate_uuid}`, '_blank');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-12 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 text-brand-charcoal dark:text-white">
            <header className="flex flex-col gap-2 border-b border-brand-border pb-6 md:pb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-amber-500/10 rounded-md">
                        <Trophy className="text-amber-500" size={14} />
                    </div>
                    <span className="text-amber-500 font-bold text-[10px] md:text-xs uppercase tracking-wider">Academic Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                    My Certificates
                </h1>
                <p className="text-brand-muted text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                    All certificates you've earned across your enrolled courses.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-brand-emerald" size={32} />
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-brand-charcoal p-6 sm:p-10 rounded-[24px] border border-red-100 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={26} />
                    </div>
                    <p className="text-brand-muted text-sm">{error}</p>
                </div>
            ) : certificates.length === 0 ? (
                <div className="bg-brand-beige dark:bg-white/5 py-16 md:py-20 px-4 text-center rounded-[32px] border border-dashed border-brand-border max-w-2xl mx-auto">
                    <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-muted">
                        <Award size={26} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black mb-1">No Certificates Yet</h2>
                    <p className="text-brand-muted text-xs sm:text-sm max-w-xs mx-auto font-medium">
                        Complete a course (and its final exam, where required) to earn your first certificate.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="bg-white dark:bg-brand-charcoal border border-brand-border rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <a
                                href={`/verify/${cert.certificate_uuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block aspect-[1.414/1] bg-brand-beige dark:bg-white/5 overflow-hidden"
                            >
                                {cert.certificate_path ? (
                                    <img
                                        src={cert.certificate_path}
                                        alt={`${cert.course_title} certificate`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                                        <Award size={40} />
                                    </div>
                                )}
                            </a>

                            <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
                                <div>
                                    <h3 className="font-black text-base leading-snug mb-1 line-clamp-2">{cert.course_title}</h3>
                                    <p className="text-brand-muted text-xs font-semibold">
                                        Issued {new Date(cert.issued_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {cert.issued_by ? ` · ${cert.issued_by}` : ''}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mt-auto">
                                    <button
                                        onClick={() => downloadCertificate(cert)}
                                        disabled={downloadingId === cert.id}
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-emerald text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {downloadingId === cert.id ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            <Download size={14} />
                                        )}
                                        Download
                                    </button>
                                    <Link
                                        to={`/verify/${cert.certificate_uuid}`}
                                        target="_blank"
                                        className="inline-flex items-center justify-center gap-1.5 border border-brand-border text-brand-muted text-xs font-black uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-brand-beige dark:hover:bg-white/5 transition-all no-underline"
                                    >
                                        <ShieldCheck size={14} /> Verify
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
