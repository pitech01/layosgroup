import { Calendar, Clock, Video, ExternalLink, User } from 'lucide-react';

const UPCOMING_SESSIONS = [
    {
        id: 1,
        courseName: 'Advanced React Development',
        topic: 'Live Q&A: State Management Patterns',
        instructor: 'Sarah Wilson',
        date: 'Today',
        time: '15:00 - 16:30',
        status: 'Uncoming',
        meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
        id: 2,
        courseName: 'UI/UX Design Masterclass',
        topic: 'Design Review & Feedback',
        instructor: 'Michael Chen',
        date: 'Tomorrow',
        time: '10:00 - 11:30',
        status: 'Scheduled',
        meetLink: '#'
    }
];

const PAST_SESSIONS = [
    {
        id: 101,
        courseName: 'Advanced React Development',
        topic: 'Introduction to Next.js',
        date: 'Feb 10, 2024',
        duration: '1h 30m',
        recordingUrl: '#'
    },
    {
        id: 102,
        courseName: 'Full Stack Web Development',
        topic: 'API Security Best Practices',
        date: 'Feb 08, 2024',
        duration: '1h 15m',
        recordingUrl: '#'
    }
];

const Live = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Live Sessions</h1>
                <p className="text-slate-500">Join upcoming classes or watch recorded sessions.</p>
            </div>

            {/* Upcoming Sessions */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Upcoming & Live
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {UPCOMING_SESSIONS.map((session) => (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Video size={100} className="text-slate-50/50 transform rotate-12 -mr-8 -mt-8 pointer-events-none text-slate-100" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                        {session.courseName}
                                    </span>
                                    {session.date === 'Today' && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded animate-pulse">
                                            LIVE SOON
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2">{session.topic}</h3>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <User size={16} className="mr-2 text-slate-400" />
                                        {session.instructor}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Calendar size={16} className="mr-2 text-slate-400" />
                                        {session.date} &bull; {session.time}
                                    </div>
                                </div>

                                <a
                                    href={session.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors gap-2"
                                >
                                    Join Live Class <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Past Sessions */}
            <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Past Sessions</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {PAST_SESSIONS.map((session) => (
                            <div key={session.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                <div>
                                    <h4 className="font-bold text-slate-800">{session.topic}</h4>
                                    <p className="text-sm text-slate-500 mb-1">{session.courseName}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {session.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {session.duration}</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-colors">
                                    Watch Recording
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Live;
