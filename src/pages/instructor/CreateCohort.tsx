import { useState } from 'react';
import {
    Globe,
    Shield,
    DollarSign,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateCohort() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        timezone: 'UTC+1 (WAT)',
        deliveryMode: 'recorded',
        seatLimit: 100,
        pricing: '',
        visibility: 'public'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save logic
        const cohortId = `CH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        console.log("Cohort Created:", formData);
        // Redirect to detail page
        navigate(`/instructor/cohorts/${cohortId}`);
    };

    return (
        <div className="create-cohort-container animate-fade-in">
            <style>{`
                .create-cohort-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 0;
                }

                .breadcrumb-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    transition: color 0.2s;
                }

                .breadcrumb-back:hover { color: #1a4d3e; }

                .form-header-premium {
                    margin-bottom: 3rem;
                }

                .form-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0 0 0.5rem 0;
                }

                .form-header-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .cohort-form-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                .input-group-premium {
                    margin-bottom: 2rem;
                }

                .input-group-premium label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 900;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

                .input-premium {
                    width: 100%;
                    height: 56px;
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 0 1.25rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .input-premium:focus {
                    background: white;
                    border-color: #1a4d3e;
                    outline: none;
                    box-shadow: 0 0 0 5px rgba(26, 77, 62, 0.05);
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .select-premium {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.25rem;
                }

                .submit-btn-premium {
                    width: 100%;
                    height: 64px;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 1.1rem;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                .submit-btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.25);
                }

                .section-tile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                    margin-top: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .section-tile span {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                }
            `}</style>

            <Link to="/instructor/cohorts" className="breadcrumb-back">
                <ArrowLeft size={18} /> Back to Cohort Inventory
            </Link>

            <div className="form-header-premium">
                <h1>Deploy New Operational Shell</h1>
                <p>Initialize a secure, managed cohort environment for your students.</p>
            </div>

            <form className="cohort-form-card shadow-premium" onSubmit={handleSubmit}>
                <div className="section-tile">
                    <Shield size={20} color="#1a4d3e" />
                    <span>Identity & Access</span>
                </div>

                <div className="input-group-premium">
                    <label>Internal Cohort Designation</label>
                    <input
                        type="text"
                        className="input-premium"
                        placeholder="e.g. Masterclass Batch Jan 2026"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="form-grid-2">
                    <div className="input-group-premium">
                        <label>Deployment Start</label>
                        <input
                            type="date"
                            className="input-premium"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div className="input-group-premium">
                        <label>Lifecycle End</label>
                        <input
                            type="date"
                            className="input-premium"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="input-group-premium">
                    <label>Enrollment Termination Deadline</label>
                    <input
                        type="date"
                        className="input-premium"
                        required
                        value={formData.enrollmentDeadline}
                        onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                    />
                </div>

                <div className="section-tile">
                    <Globe size={20} color="#1a4d3e" />
                    <span>Logistics & Capacity</span>
                </div>

                <div className="form-grid-2">
                    <div className="input-group-premium">
                        <label>Operational Timezone</label>
                        <select
                            className="input-premium select-premium"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                            <option>UTC+1 (WAT)</option>
                            <option>UTC+0 (GMT)</option>
                            <option>UTC-5 (EST)</option>
                        </select>
                    </div>
                    <div className="input-group-premium">
                        <label>Delivery Mode</label>
                        <select
                            className="input-premium select-premium"
                            value={formData.deliveryMode}
                            onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                        >
                            <option value="recorded">On-Demand Asset</option>
                            <option value="live">Synchronous Live</option>
                            <option value="hybrid">Hybrid Deployment</option>
                        </select>
                    </div>
                </div>

                <div className="form-grid-2">
                    <div className="input-group-premium">
                        <label>Seat Capacity</label>
                        <input
                            type="number"
                            className="input-premium"
                            placeholder="100"
                            value={formData.seatLimit}
                            onChange={(e) => setFormData({ ...formData, seatLimit: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="input-group-premium">
                        <label>Operational Visibility</label>
                        <select
                            className="input-premium select-premium"
                            value={formData.visibility}
                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        >
                            <option value="public">Public Marketplace</option>
                            <option value="private">Invite-Only Access</option>
                        </select>
                    </div>
                </div>

                <div className="section-tile">
                    <DollarSign size={20} color="#1a4d3e" />
                    <span>Fiscal Settings</span>
                </div>

                <div className="input-group-premium">
                    <label>Enrollment Value (USD)</label>
                    <input
                        type="text"
                        className="input-premium"
                        placeholder="e.g. 199.00"
                        required
                        value={formData.pricing}
                        onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    />
                </div>

                <button type="submit" className="submit-btn-premium">
                    Deploy Operational Shell <ChevronRight size={20} />
                </button>
            </form>
        </div>
    );
}

