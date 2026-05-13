import { useState } from 'react';
import {
    Search,
    Bell,
    ChevronDown,
    Menu,
    X,
    MessageSquare,
    BookOpen,
    Clock,
    Command
} from 'lucide-react';

interface TopbarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Topbar = ({ collapsed, onToggle }: TopbarProps) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="h-20 bg-white/90 dark:bg-brand-charcoal/90 backdrop-blur-md border-b border-brand-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
            {/* Left side: Search & Toggle */}
            <div className="flex items-center gap-4 min-w-0">
                <button
                    className={`p-2.5 rounded-xl text-brand-muted hover:bg-brand-beige dark:hover:bg-white/5 hover:text-brand-emerald transition-all duration-200 border-none cursor-pointer ${!collapsed ? 'text-brand-emerald bg-brand-emerald/10' : ''}`}
                    onClick={onToggle}
                    aria-label="Toggle Sidebar"
                >
                    {collapsed ? <Menu size={20} /> : <X size={20} />}
                </button>

                <div className="hidden md:flex items-center bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl px-4 py-2 w-full max-w-[400px] transition-all duration-300 focus-within:bg-white dark:focus-within:bg-brand-charcoal focus-within:border-brand-emerald/40 focus-within:shadow-sm group">
                    <Search size={18} className="text-brand-muted group-focus-within:text-brand-emerald transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for courses, lessons..."
                        className="bg-transparent border-none outline-none p-2 w-full text-sm font-medium text-brand-charcoal dark:text-white"
                    />
                    <div className="hidden lg:flex items-center gap-1 bg-white dark:bg-white/10 px-1.5 py-1 rounded-lg border border-brand-border text-brand-muted text-[10px] font-black">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
                <div className="flex items-center gap-1">
                    <button className="p-3 text-brand-muted hover:bg-brand-beige dark:hover:bg-white/5 hover:text-brand-emerald rounded-xl transition-all relative border-none cursor-pointer" title="Messages">
                        <MessageSquare size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-emerald rounded-full border-2 border-white dark:border-brand-charcoal"></span>
                    </button>

                    <div className="relative">
                        <button
                            className={`p-3 text-brand-muted hover:bg-brand-beige dark:hover:bg-white/5 hover:text-brand-emerald rounded-xl transition-all relative border-none cursor-pointer ${notificationsOpen ? 'bg-brand-emerald/10 text-brand-emerald' : ''}`}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            title="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-charcoal animate-pulse"></span>
                        </button>

                        {notificationsOpen && (
                            <div className="absolute top-14 right-0 w-80 md:w-96 bg-white dark:bg-brand-charcoal border border-brand-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-beige/20">
                                    <h3 className="m-0 text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Notifications</h3>
                                    <button className="text-[10px] font-black text-brand-emerald hover:underline bg-transparent border-none cursor-pointer uppercase">Mark all as read</button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-2">
                                    {[
                                        { title: 'New lesson uploaded', text: 'React Patterns: Module 4 is now live', time: '2 minutes ago', icon: BookOpen, color: 'blue' },
                                        { title: 'Class starts in 30min', text: 'Advanced Design Systems live session', time: '1 hour ago', icon: Clock, color: 'purple' }
                                    ].map((notif, i) => (
                                        <div key={i} className="p-4 flex gap-4 hover:bg-brand-beige dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                                                <notif.icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-brand-charcoal dark:text-white m-0 truncate">{notif.title}</p>
                                                <p className="text-xs text-brand-muted m-0 line-clamp-1">{notif.text}</p>
                                                <span className="text-[10px] font-bold text-brand-muted/60 mt-1 block">{notif.time}</span>
                                            </div>
                                            <div className="w-2 h-2 bg-brand-emerald rounded-full mt-2 shrink-0"></div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-4 text-[10px] font-black text-brand-charcoal dark:text-white bg-brand-beige/30 hover:bg-brand-beige/50 transition-colors uppercase tracking-widest border-none cursor-pointer border-t border-brand-border">View All Notifications</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:block w-px h-8 bg-brand-border"></div>

                <div className="flex items-center gap-3 p-1 pl-3 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl group cursor-pointer hover:bg-white transition-all">
                    <div className="flex flex-col text-right">
                        <span className="text-xs font-black text-brand-charcoal dark:text-white">Anna Student</span>
                        <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">Level 12</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                        AS
                    </div>
                    <ChevronDown size={14} className="mr-2 text-brand-muted" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
