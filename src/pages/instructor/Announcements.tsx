import { useState, useEffect, useRef } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Loader2,
    Calendar,
    X,
    Eye,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Announcement {
    id: number;
    title: string;
    category: string;
    excerpt: string;
    content: string;
    image_url: string | null;
    created_at: string;
}

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Student Success');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Loaders
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/announcements`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (res.ok) {
                setAnnouncements(Array.isArray(data) ? data : []);
            } else {
                toast.error(data.message || 'Failed to fetch announcements.');
            }
        } catch (err) {
            console.error('Failed to load announcements', err);
            toast.error('Connection failed. Please check your backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !excerpt.trim() || !content.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setCreating(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('excerpt', excerpt);
        formData.append('content', content);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch(`${API_URL}/announcements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Announcement published successfully!');
                setAnnouncements(prev => [data, ...prev]);
                // Reset form
                setTitle('');
                setCategory('Student Success');
                setExcerpt('');
                setContent('');
                setImageFile(null);
                setImagePreview(null);
                setShowCreateModal(false);
            } else {
                toast.error(data.message || 'Failed to publish announcement.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection failed.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAnnouncement = async (id: number) => {
        if (!window.confirm('Are you sure you want to permanently delete this announcement?')) {
            return;
        }
        setDeletingId(id);
        try {
            const res = await fetch(`${API_URL}/announcements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                toast.success('Announcement deleted successfully.');
                setAnnouncements(prev => prev.filter(a => a.id !== id));
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || 'Failed to delete announcement.');
            }
        } catch (err) {
            toast.error('Deletion failed. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getCategoryBadgeColor = (cat: string) => {
        switch (cat) {
            case 'Student Success': return { bg: '#ecfdf5', color: '#047857', border: '#bbf7d0' };
            case 'Cohort Launch': return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
            case 'Webinar': return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        }
    };

    return (
        <div className="animate-fade-in-up instructor-announcements-container">
            <style>{`
                .staff-scope .instructor-announcements-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .staff-scope .announcements-header-block {
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .announcements-header-block h1 {
                    font-size: 2.25rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.03em;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .staff-scope .btn-add-announcement {
                    background: #1a4d3e;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 14px;
                    border: none;
                    font-weight: 800;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                .btn-add-announcement:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px -3px rgba(26, 77, 62, 0.35);
                    background: #153e32;
                }

                .staff-scope .announcements-dashboard-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.01);
                    margin-bottom: 2.5rem;
                    padding: 2rem;
                }

                /* Grid Layout */
                .staff-scope .announcements-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.75rem;
                }

                @media (min-width: 768px) {
                    .staff-scope .announcements-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .staff-scope .announcements-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* Cards Styling */
                .staff-scope .announcement-card-premium {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
                }

                .announcement-card-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 35px rgba(26, 77, 62, 0.08);
                    border-color: #cbd5e1;
                }

                .staff-scope .card-banner-box {
                    position: relative;
                    aspect-ratio: 16 / 9;
                    background: #f8fafc;
                    overflow: hidden;
                    border-bottom: 1px solid #e2e8f0;
                }

                .card-banner-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }

                .announcement-card-premium:hover .card-banner-box img {
                    transform: scale(1.05);
                }

                .staff-scope .banner-overlay-preview {
                    position: absolute;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    color: white;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    gap: 6px;
                }

                .card-banner-box:hover .banner-overlay-preview {
                    opacity: 1;
                }

                .staff-scope .card-details-box {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    gap: 0.75rem;
                }

                .staff-scope .card-meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .staff-scope .card-date-badge {
                    font-size: 0.78rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 700;
                }

                .staff-scope .card-category-badge {
                    font-size: 0.7rem;
                    font-weight: 900;
                    padding: 0.3rem 0.75rem;
                    border-radius: 9999px;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    border: 1px solid transparent;
                }

                .staff-scope .card-title-text {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    line-height: 1.3;
                    letter-spacing: -0.02em;
                }

                .staff-scope .card-excerpt-text {
                    font-size: 0.88rem;
                    color: #64748b;
                    line-height: 1.5;
                    margin: 0;
                    font-weight: 500;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex-grow: 1;
                }

                .announcement-card-premium:hover .card-excerpt-text {
                    -webkit-line-clamp: unset;
                    overflow: visible;
                }

                .staff-scope .card-actions-row {
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                }

                /* Modal styling */
                .staff-scope .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1.5rem;
                }

                .staff-scope .modal-content-box {
                    background: white;
                    width: 100%;
                    max-width: 600px;
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .staff-scope .modal-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .modal-title-row h3 {
                    margin: 0;
                    font-size: 1.35rem;
                    font-weight: 950;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .staff-scope .form-group-premium {
                    margin-bottom: 1.5rem;
                }

                .form-group-premium label {
                    display: block;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                    font-size: 0.88rem;
                }

                .staff-scope .form-input-premium {
                    width: 100%;
                    padding: 0.8rem 1.25rem;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                }

                .form-input-premium:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(26,77,62,0.05);
                }

                .staff-scope .form-textarea-premium {
                    width: 100%;
                    padding: 0.8rem 1.25rem;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                    resize: none;
                }

                .form-textarea-premium:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(26,77,62,0.05);
                }

                /* Uploader premium styling */
                .staff-scope .banner-uploader-box {
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .banner-uploader-box:hover {
                    border-color: #1a4d3e;
                    background: #f0fdf4;
                }

                .staff-scope .uploader-preview-banner {
                    width: 100%;
                    max-height: 200px;
                    border-radius: 12px;
                    object-fit: cover;
                    border: 1px solid #cbd5e1;
                }

                /* Lightbox preview */
                .staff-scope .lightbox-overlay-premium {
                    position: fixed;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.95);
                    backdrop-filter: blur(12px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .staff-scope .lightbox-image {
                    max-width: 90%;
                    max-height: 90%;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    border: 2px solid rgba(255,255,255,0.1);
                    object-fit: contain;
                }

                .staff-scope .btn-lightbox-close {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-lightbox-close:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>

            <header className="announcements-header-block">
                <div>
                    <h1><Megaphone size={30} color="#1a4d3e" /> Academic Announcements</h1>
                    <p style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>Compose and broadcast general bulletins, course webinar alerts, and student success stories onto the landing page.</p>
                </div>
                <button className="btn-add-announcement" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Compose Post
                </button>
            </header>

            <div className="announcements-dashboard-card">
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
                        <Loader2 size={42} className="animate-spin" color="#1a4d3e" />
                        <p style={{ color: '#64748b', fontWeight: 700 }}>Fetching announcements logs...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed #e2e8f0', borderRadius: '24px', background: '#f8fafc' }}>
                        <Megaphone size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569', margin: 0 }}>No Announcements Found</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 600 }}>Create your first dynamic announcement post to highlight important alerts to visitors.</p>
                    </div>
                ) : (
                    <div className="announcements-grid animate-fade-in-up">
                        {announcements.map((announcement) => {
                            const badge = getCategoryBadgeColor(announcement.category);
                            return (
                                <div key={announcement.id} className="announcement-card-premium">
                                    <div className="card-banner-box">
                                        {announcement.image_url ? (
                                            <>
                                                <img src={announcement.image_url} alt={announcement.title} />
                                                <div className="banner-overlay-preview" onClick={() => setPreviewImage(announcement.image_url)}>
                                                    <Eye size={18} /> Enlarged Preview
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8', gap: '8px' }}>
                                                <ImageIcon size={32} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>No Banner Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-details-box">
                                        <div className="card-meta-row">
                                            <span className="card-date-badge">
                                                <Calendar size={14} /> {formatDate(announcement.created_at)}
                                            </span>
                                            <span 
                                                className="card-category-badge"
                                                style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
                                            >
                                                {announcement.category}
                                            </span>
                                        </div>

                                        <h3 className="card-title-text">{announcement.title}</h3>
                                        <p className="card-excerpt-text">{announcement.excerpt}</p>

                                        <div className="card-actions-row">
                                            <button
                                                className="action-mini-trigger delete"
                                                title="Delete Announcement Permanently"
                                                disabled={deletingId === announcement.id}
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                                            >
                                                {deletingId === announcement.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox Preview */}
            {previewImage && (
                <div className="lightbox-overlay-premium" onClick={() => setPreviewImage(null)}>
                    <button className="btn-lightbox-close" onClick={() => setPreviewImage(null)}>
                        <X size={24} />
                    </button>
                    <img src={previewImage} alt="Enlarged Poster Screenshot" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* Create Announcement Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content-box animate-fade-in-up">
                        <div className="modal-title-row">
                            <h3><Megaphone size={22} color="#1a4d3e" /> Compose New Announcement</h3>
                            <button 
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setImageFile(null);
                                    setImagePreview(null);
                                }}
                                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handlePostAnnouncement}>
                            <div className="form-group-premium">
                                <label>Announcement Title *</label>
                                <input
                                    type="text"
                                    className="form-input-premium"
                                    placeholder="e.g. BIG WIN ALERT 🚨 or New Cohort Launch Details"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group-premium">
                                <label>Broadcasting Category *</label>
                                <select
                                    className="form-input-premium"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="Student Success">Student Success</option>
                                    <option value="Cohort Launch">Cohort Launch</option>
                                    <option value="Webinar">Webinar</option>
                                    <option value="General Support">General Support</option>
                                </select>
                            </div>

                            <div className="form-group-premium">
                                <label>Short Excerpt Teaser *</label>
                                <textarea
                                    className="form-textarea-premium"
                                    placeholder="Provide a quick summary teaser of the announcement to display in the main card (max 200 chars)..."
                                    value={excerpt}
                                    onChange={e => setExcerpt(e.target.value)}
                                    rows={3}
                                    maxLength={250}
                                    required
                                />
                            </div>

                            <div className="form-group-premium">
                                <label>Detailed Broadcast Content *</label>
                                <textarea
                                    className="form-textarea-premium"
                                    placeholder="Compose the full detailed announcement message to be viewed inside the detail side drawer..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="form-group-premium">
                                <label>Teaser Banner / Poster Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                                        <img src={imagePreview} alt="Selected Banner Preview" className="uploader-preview-banner" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(2, 6, 23, 0.8)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        className="banner-uploader-box"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={32} color="#64748b" />
                                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#475569' }}>Click to Upload Banner Image</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 650 }}>Supports jpeg, png, webp (max 10MB)</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '2.5rem' }}>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, border: '1.5px solid #e2e8f0', background: '#f8fafc', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', color: '#64748b' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-confirm"
                                    disabled={creating}
                                    style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, background: '#1a4d3e', color: 'white', borderRadius: '14px', fontWeight: 850, border: 'none', cursor: creating ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(26, 77, 62, 0.2)' }}
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} style={{ marginRight: '6px' }} />
                                            <span>Publishing...</span>
                                        </>
                                    ) : (
                                        <span>Publish Announcement</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
