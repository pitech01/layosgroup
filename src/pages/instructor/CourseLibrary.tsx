import { useState } from 'react';
import {
    Plus,
    Layers,
    Search,
    Filter,
    Copy,
    Calendar,
    Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseLibrary() {
    const [searchQuery, setSearchQuery] = useState('');

    const templates = [
        {
            id: 'TPL-1',
            title: "Executive Brand Systems",
            category: "Design Strategy",
            level: "Intermediate",
            modulesCount: 8,
            createdDate: "Oct 12, 2025",
            description: "High-level brand logic and visual system architecture."
        },
        {
            id: 'TPL-2',
            title: "Digital Market Psychology",
            category: "Marketing",
            level: "Advanced",
            modulesCount: 12,
            createdDate: "Nov 05, 2025",
            description: "Deep-dive into consumer behavioral funnels and high-conversion logic."
        },
        {
            id: 'TPL-3',
            title: "React Architecture Patterns",
            category: "Development",
            level: "Expert",
            modulesCount: 15,
            createdDate: "Jan 20, 2026",
            description: "Scalable frontend architectures for enterprise-grade applications."
        }
    ];

    return (
        <div className="course-library-container">
            <style>{`
                .library-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3.5rem;
                }

                .library-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                .library-header-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0 0;
                }

                .search-filter-belt {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .search-pill-premium {
                    flex: 1;
                    height: 56px;
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

                .search-pill-premium input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                }

                .filter-pill-premium {
                    width: 180px;
                    height: 56px;
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                    font-weight: 800;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-pill-premium:hover { border-color: #1a4d3e30; color: #1a4d3e; }

                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 2rem;
                }

                .template-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .template-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 30px -10px rgba(0,0,0,0.05);
                    border-color: #1a4d3e40;
                }

                .category-badge-library {
                    padding: 4px 10px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.25rem;
                    display: inline-block;
                }

                .template-title-premium {
                    font-size: 1.4rem;
                    font-weight: 950;
                    margin: 0 0 0.75rem 0;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .template-description-premium {
                    font-size: 0.95rem;
                    color: #64748b;
                    font-weight: 500;
                    line-height: 1.5;
                    margin-bottom: 2rem;
                    height: 48px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .template-meta-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1.5px solid #f1f5f9;
                }

                .meta-item-library {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .action-fab-library {
                    width: 44px;
                    height: 44px;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-fab-library:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .btn-create-master {
                    height: 60px;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 18px;
                    padding: 0 2rem;
                    font-weight: 950;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                .btn-create-master:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.25);
                }
            `}</style>

            <div className="library-header-premium">
                <div>
                    <h1>Course</h1>
                    <p>Manage and reuse your course templates.</p>
                </div>
                <Link to="/instructor/course-library/create" className="btn-create-master" style={{ textDecoration: 'none' }}>
                    <Plus size={20} /> Create New Course
                </Link>
            </div>

            <div className="search-filter-belt">
                <div className="search-pill-premium shadow-premium">
                    <Search size={22} color="#94a3b8" />
                    <input
                        placeholder="Search courses by title, level, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-pill-premium shadow-premium">
                    <span>Level</span>
                    <Filter size={18} />
                </div>
                <div className="filter-pill-premium shadow-premium">
                    <span>Category</span>
                    <Filter size={18} />
                </div>
            </div>

            <div className="template-grid">
                {templates.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(template => (
                    <div key={template.id} className="template-card-premium shadow-premium">
                        <div className="category-badge-library">{template.category}</div>
                        <h3 className="template-title-premium">{template.title}</h3>
                        <p className="template-description-premium">{template.description}</p>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="meta-item-library">
                                <Layers size={16} /> {template.modulesCount} Modules
                            </div>
                            <div className="meta-item-library">
                                <Award size={16} /> {template.level}
                            </div>
                        </div>

                        <div className="template-meta-strip">
                            <div className="meta-item-library">
                                <Calendar size={14} /> Registered: {template.createdDate}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="action-fab-library" title="Clone Template"><Copy size={18} /></button>
                                <button className="action-fab-library" title="Edit Master"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
