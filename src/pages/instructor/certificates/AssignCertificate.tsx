import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface StudentCohort {
    id: string;
    name: string;
    course?: { id: number; title: string };
}

interface StudentDetail extends Student {
    cohorts?: StudentCohort[];
}

export default function AssignCertificate() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [selectedCohortId, setSelectedCohortId] = useState<string>('');

    const [form, setForm] = useState({ fullName: '', courseTitle: '', issuedAt: new Date().toISOString().substring(0, 10), issuedBy: user?.name || 'Instructor' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/students`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.status === 401) {
                    logout();
                    navigate('/instructor-login');
                    return;
                }
                const data = await response.json();
                if (response.ok) setStudents(data);
            } catch {
                toast.error('Failed to load students.');
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSelectStudent = async (student: Student) => {
        setSelectedStudent(student);
        setStudentDetail(null);
        setSelectedCohortId('');
        setLoadingDetail(true);
        try {
            const response = await fetch(`${API_URL}/students/${student.id}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStudentDetail(data);
                setForm((f) => ({ ...f, fullName: data.name }));
            } else {
                toast.error(data.message || 'Failed to load student details.');
            }
        } catch {
            toast.error('Failed to load student details.');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSelectCohort = (cohortId: string) => {
        setSelectedCohortId(cohortId);
        const cohort = studentDetail?.cohorts?.find((c) => c.id === cohortId);
        if (cohort) {
            setForm((f) => ({ ...f, courseTitle: cohort.course?.title || '' }));
        }
    };

    const selectedCohort = studentDetail?.cohorts?.find((c) => c.id === selectedCohortId);

    const handleSubmit = async () => {
        if (!selectedStudent || !selectedCohort) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/instructor/certificates/generate-manual`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    course_id: selectedCohort.course?.id,
                    cohort_id: selectedCohort.id,
                    user_id: selectedStudent.id,
                    full_name: form.fullName,
                    course_title: form.courseTitle,
                    issued_at: form.issuedAt,
                    issued_by: form.issuedBy
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Certificate assigned successfully!');
                setSelectedStudent(null);
                setStudentDetail(null);
                setSelectedCohortId('');
            } else {
                throw new Error(data.message || 'Failed to assign certificate.');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to assign certificate.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter((s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="assign-cert-container animate-fade-in">
            <style>{`
                .staff-scope .assign-cert-container { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
                .staff-scope .assign-header { margin-bottom: 2.5rem; }
                .staff-scope .assign-header h1 { font-size: 2.25rem; font-weight: 950; color: var(--index-text-heading); letter-spacing: -0.04em; margin: 0 0 0.5rem 0; }
                .staff-scope .assign-header p { color: var(--index-text-secondary); font-size: 1.05rem; font-weight: 600; margin: 0; }
                .staff-scope .assign-card { background: white; border: 1.5px solid var(--index-hover-bg); border-radius: 32px; padding: 2.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
                .staff-scope .assign-search { width: 100%; height: 56px; background: var(--index-hover-bg); border: 2px solid var(--index-hover-bg); border-radius: 16px; padding: 0 1.25rem 0 3rem; font-size: 1rem; font-weight: 600; color: var(--index-text-heading); box-sizing: border-box; }
                .staff-scope .assign-search:focus { background: white; border-color: var(--index-primary-color); outline: none; }
                .staff-scope .student-pick-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-radius: 16px; cursor: pointer; transition: background 0.15s; }
                .staff-scope .student-pick-row:hover { background: var(--index-hover-bg); }
                .staff-scope .input-group-premium { margin-bottom: 1.5rem; }
                .staff-scope .input-group-premium label { display: block; font-size: 0.85rem; font-weight: 900; color: var(--index-text-heading); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
                .staff-scope .input-premium { width: 100%; height: 56px; background: var(--index-hover-bg); border: 2px solid var(--index-hover-bg); border-radius: 16px; padding: 0 1.25rem; font-size: 1rem; font-weight: 600; color: var(--index-text-heading); box-sizing: border-box; }
                .staff-scope .input-premium:focus { background: white; border-color: var(--index-primary-color); outline: none; }
                .staff-scope .submit-btn-premium { width: 100%; height: 64px; background: var(--index-primary-color); color: white; border: none; border-radius: 20px; font-size: 1.1rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; }
                .staff-scope .submit-btn-premium:disabled { opacity: 0.5; cursor: not-allowed; }
                .staff-scope .selected-student-chip { display: flex; align-items: center; justify-content: space-between; background: var(--index-accent-soft-bg); border-radius: 16px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
            `}</style>

            <div className="assign-header">
                <h1>Assign Certificate</h1>
                <p>Manually issue a certificate to a student for one of their cohorts.</p>
            </div>

            <div className="assign-card">
                {!selectedStudent ? (
                    <>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--index-text-faint)' }} />
                            <input
                                type="text"
                                className="assign-search"
                                placeholder="Search students by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {loadingStudents ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--index-primary-color)" />
                            </div>
                        ) : (
                            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                {filteredStudents.slice(0, 50).map((s) => (
                                    <div key={s.id} className="student-pick-row" onClick={() => handleSelectStudent(s)}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--index-text-secondary)' }}>{s.email}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--index-text-faint)', padding: '2rem' }}>No students found.</p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="selected-student-chip">
                            <div>
                                <div style={{ fontWeight: 900, color: 'var(--index-primary-color)' }}>{selectedStudent.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)' }}>{selectedStudent.email}</div>
                            </div>
                            <button
                                onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--index-text-secondary)', display: 'flex' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {loadingDetail ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" size={28} color="var(--index-primary-color)" />
                            </div>
                        ) : (
                            <>
                                <div className="input-group-premium">
                                    <label>Cohort</label>
                                    <select
                                        className="input-premium"
                                        value={selectedCohortId}
                                        onChange={(e) => handleSelectCohort(e.target.value)}
                                    >
                                        <option value="">Select a cohort...</option>
                                        {studentDetail?.cohorts?.filter((c) => c.course).map((c) => (
                                            <option key={c.id} value={c.id}>{c.name} — {c.course?.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCohortId && (
                                    <>
                                        <div className="input-group-premium">
                                            <label>Recipient Name</label>
                                            <input
                                                type="text"
                                                className="input-premium"
                                                value={form.fullName}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group-premium">
                                            <label>Course Title</label>
                                            <input
                                                type="text"
                                                className="input-premium"
                                                value={form.courseTitle}
                                                onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group-premium">
                                            <label>Issue Date</label>
                                            <input
                                                type="date"
                                                className="input-premium"
                                                value={form.issuedAt}
                                                onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group-premium">
                                            <label>Issued By</label>
                                            <input
                                                type="text"
                                                className="input-premium"
                                                value={form.issuedBy}
                                                onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                                            />
                                        </div>

                                        <button className="submit-btn-premium" onClick={handleSubmit} disabled={submitting}>
                                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Award size={20} />}
                                            {submitting ? 'Assigning...' : 'Assign Certificate'}
                                        </button>
                                    </>
                                )}

                                {!selectedCohortId && studentDetail?.cohorts?.filter((c) => c.course).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--index-text-faint)' }}>
                                        <AlertCircle size={28} style={{ marginBottom: '0.75rem' }} />
                                        <p>This student has no cohorts with an attached course.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
