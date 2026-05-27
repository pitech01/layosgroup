import { useState, useEffect, useRef } from 'react';
import {
    Star,
    Trash2,
    Loader2,
    Calendar,
    Filter,
    MessageSquare,
    Image,
    Upload,
    Eye,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
    id: number;
    name: string;
    title: string;
    category: 'courses' | 'placement' | 'coaching' | 'general';
    content: string;
    image: string | null;
    created_at: string;
}

const Reviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'courses' | 'placement' | 'coaching' | 'general'>('all');
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/instructor/reviews`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (res.ok) {
                setReviews(Array.isArray(data) ? data : []);
            } else {
                toast.error(data.message || 'Failed to fetch reviews.');
            }
        } catch (err) {
            console.error('Failed to load reviews', err);
            toast.error('Connection failed. Please check your backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            await handleUploadScreenshot(id, file);
        }
    };

    const handleUploadScreenshot = async (id: number, file: File) => {
        setUploadingId(id);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/instructor/reviews/${id}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Review screenshot uploaded successfully!');
                setReviews(prev => prev.map(r => r.id === id ? { ...r, image: data.review.image } : r));
            } else {
                toast.error(data.message || 'Failed to upload screenshot.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Screenshot upload failed.');
        } finally {
            setUploadingId(null);
        }
    };

    const handleDeleteReview = async (id: number) => {
        if (!window.confirm('Are you absolutely sure you want to permanently delete this review? This action cannot be undone.')) {
            return;
        }
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/instructor/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                toast.success('Review permanently deleted.');
                setReviews(prev => prev.filter(r => r.id !== id));
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || 'Failed to delete review.');
            }
        } catch (err) {
            toast.error('Deletion failed. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'courses': return 'badge-courses';
            case 'placement': return 'badge-placement';
            case 'coaching': return 'badge-coaching';
            default: return 'badge-general';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'courses': return 'Primavera Masterclass';
            case 'placement': return 'CV & Placement';
            case 'coaching': return '1-on-1 Mentorship';
            default: return 'General Support';
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

    // Filter Reviews Logic
    const filteredReviews = reviews.filter(review => {
        return categoryFilter === 'all' || review.category === categoryFilter;
    });

    return (
        <div className="animate-fade-in-up instructor-reviews-container">
            <style>{`
                .staff-scope .instructor-reviews-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                }

                .staff-scope .reviews-header-block {
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .reviews-header-block h1 {
                    font-size: 2.25rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.03em;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .staff-scope .reviews-dashboard-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.01);
                    margin-bottom: 2.5rem;
                    padding: 2rem;
                }

                /* Filters & Navigation Control */
                .staff-scope .reviews-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 1.5rem;
                }

                .staff-scope .filter-select-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .staff-scope .select-premium-dropdown {
                    height: 44px;
                    padding: 0 1.25rem;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #475569;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .select-premium-dropdown:focus {
                    border-color: #1a4d3e;
                    background: white;
                }

                /* Review Grid Layout */
                .staff-scope .reviews-grid-deck {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.75rem;
                }

                @media (min-width: 900px) {
                    .staff-scope .reviews-grid-deck {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                /* Premium Card styling */
                .staff-scope .review-premium-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
                }

                .review-premium-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.05);
                    border-color: #cbd5e1;
                }

                .staff-scope .review-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .staff-scope .reviewer-bio-block {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .staff-scope .avatar-reviewer-box {
                    width: 46px;
                    height: 46px;
                    border-radius: 12px;
                    background: #ecfdf5;
                    color: #047857;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    font-weight: 800;
                    flex-shrink: 0;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .staff-scope .reviewer-meta-text h3 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .staff-scope .reviewer-meta-text p {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0.15rem 0 0 0;
                    font-weight: 600;
                }

                /* Category Badges Styling */
                .staff-scope .category-badge-pill {
                    font-size: 0.72rem;
                    font-weight: 800;
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    flex-shrink: 0;
                }

                .badge-courses { background: #e0f2fe; color: #0369a1; }
                .badge-placement { background: #ecfdf5; color: #047857; }
                .badge-coaching { background: #f3e8ff; color: #6b21a8; }
                .badge-general { background: #f1f5f9; color: #475569; }

                .staff-scope .review-card-text {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #334155;
                    font-weight: 500;
                    margin: 0;
                    flex-grow: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .review-premium-card:hover .review-card-text {
                    -webkit-line-clamp: unset;
                    overflow: visible;
                }

                /* Screenshot Area */
                .staff-scope .screenshot-upload-area {
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }

                .staff-scope .screenshot-thumbnail-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .staff-scope .screenshot-thumb {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    object-fit: cover;
                    background: #e2e8f0;
                    border: 1px solid #cbd5e1;
                }

                .staff-scope .btn-upload-screenshot {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    font-size: 0.8rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .btn-upload-screenshot:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }

                .staff-scope .review-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1.25rem;
                    margin-top: 0.5rem;
                }

                .staff-scope .review-date-text {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                }

                /* Action triggers */
                .staff-scope .review-action-triggers {
                    display: flex;
                    gap: 0.5rem;
                }

                .staff-scope .action-mini-trigger {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-mini-trigger.delete { background: #fef2f2; color: #ef4444; }
                .action-mini-trigger.delete:hover { background: #ef4444; color: white; }

                .action-mini-trigger:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f1f5f9 !important;
                    color: #94a3b8 !important;
                }

                /* Premium Lightbox Overlay */
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

            <header className="reviews-header-block">
                <div>
                    <h1><Star size={30} fill="#1a4d3e" color="#1a4d3e" /> Alumni Reviews</h1>
                    <p style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>View submitted feedback and upload WhatsApp/conversation screenshots to showcase on the main landing page.</p>
                </div>
            </header>

            <div className="reviews-dashboard-card">
                <div className="reviews-toolbar">
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>All Feedback Submissions</h3>

                    {/* Category Filter */}
                    <div className="filter-select-wrap">
                        <Filter size={18} color="#64748b" />
                        <select
                            className="select-premium-dropdown"
                            value={categoryFilter}
                            onChange={(e: any) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="courses">Primavera Masterclass</option>
                            <option value="placement">CV & Placement</option>
                            <option value="coaching">1-on-1 Mentorship</option>
                            <option value="general">General Support</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
                        <Loader2 size={42} className="animate-spin" color="#1a4d3e" />
                        <p style={{ color: '#64748b', fontWeight: 700 }}>Fetching reviewed logs...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed #e2e8f0', borderRadius: '24px', background: '#f8fafc' }}>
                        <MessageSquare size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569', margin: 0 }}>No Reviews Found</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 600 }}>There are no reviews matching your currently active filter layout.</p>
                    </div>
                ) : (
                    <div className="reviews-grid-deck animate-fade-in-up">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="review-premium-card">
                                <div className="review-card-header">
                                    <div className="reviewer-bio-block">
                                        <div className="avatar-reviewer-box">
                                            {review.name ? review.name.split(' ').map(n => n && n[0] ? n[0] : '').join('').toUpperCase() : '?'}
                                        </div>
                                        <div className="reviewer-meta-text">
                                            <h3>{review.name}</h3>
                                            <p>{review.title}</p>
                                        </div>
                                    </div>
                                    
                                    <span className={`category-badge-pill ${getCategoryBadgeClass(review.category)}`}>
                                        {getCategoryLabel(review.category)}
                                    </span>
                                </div>

                                <p className="review-card-text">"{review.content}"</p>

                                {/* Screenshot Upload / View area */}
                                <div className="screenshot-upload-area">
                                    <div className="screenshot-thumbnail-wrap">
                                        {review.image ? (
                                            <>
                                                <img 
                                                    src={review.image} 
                                                    alt="Review Screenshot" 
                                                    className="screenshot-thumb" 
                                                />
                                                <div>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', display: 'block' }}>Screenshot Active</span>
                                                    <button 
                                                        style={{ background: 'none', border: 'none', color: '#1a4d3e', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                                                        onClick={() => setPreviewImage(review.image)}
                                                    >
                                                        <Eye size={12} /> View Image
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', color: '#94a3b8' }}>
                                                    <Image size={24} style={{ margin: 'auto' }} />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', display: 'block' }}>No Screenshot Uploaded</span>
                                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Not active on landing page</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Upload Trigger button */}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={el => { fileInputRefs.current[review.id] = el; }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e, review.id)}
                                    />
                                    <button 
                                        className="btn-upload-screenshot"
                                        disabled={uploadingId === review.id}
                                        onClick={() => fileInputRefs.current[review.id]?.click()}
                                    >
                                        {uploadingId === review.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Upload size={14} />
                                        )}
                                        {uploadingId === review.id ? 'Uploading...' : review.image ? 'Update Image' : 'Upload Image'}
                                    </button>
                                </div>

                                <div className="review-card-footer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="review-date-text">
                                            <Calendar size={14} />
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>

                                    {/* Action Triggers */}
                                    <div className="review-action-triggers">
                                        <button
                                            className="action-mini-trigger delete"
                                            title="Delete Review Permanently"
                                            disabled={actionLoading === review.id}
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            {actionLoading === review.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Screenshot Previewer */}
            {previewImage && (
                <div className="lightbox-overlay-premium" onClick={() => setPreviewImage(null)}>
                    <button className="btn-lightbox-close" onClick={() => setPreviewImage(null)}>
                        <X size={24} />
                    </button>
                    <img src={previewImage} alt="Enlarged Review Screenshot" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default Reviews;
