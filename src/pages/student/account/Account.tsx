import { useState } from 'react';
import { User, Mail, Lock, Shield, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Profile Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Security & Password
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Profile Picture */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-md">
                                        AS
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Anna Student</h3>
                                    <p className="text-slate-500 text-sm mb-2">Student ID: #883920</p>
                                    <button className="text-sm text-blue-600 font-medium hover:underline">Change Profile Photo</button>
                                </div>
                            </div>

                            {/* Form */}
                            <form className="space-y-5 max-w-lg">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input type="text" defaultValue="Anna" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input type="text" defaultValue="Student" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input type="email" defaultValue="anna@student.com" readOnly className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Contact support to change email</p>
                                </div>

                                <div className="pt-4">
                                    <button type="button" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                                <Shield className="text-yellow-600 flex-shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-sm">Security Status</h4>
                                    <p className="text-sm text-yellow-700 mt-1">Your account is secured. Last login was detected from Windows PC on Feb 14, 2024.</p>
                                </div>
                            </div>

                            <form className="space-y-5 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input type="password" placeholder="New password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input type="password" placeholder="Confirm password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-b border-slate-100 pb-8 mb-4">
                                    <button type="button" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">
                                        Update Password
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <h4 className="font-bold text-slate-800 mb-2">Session Management</h4>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors -ml-4"
                                    >
                                        <LogOut size={18} />
                                        Log Out of All Devices
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;
