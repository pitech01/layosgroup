import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Play, Download } from 'lucide-react';

const MOCK_LESSON = {
    id: 103,
    title: 'Custom Hooks',
    moduleTitle: 'Modern React Fundamentals',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Safe sample video
    description: 'In this lesson, we will explore how to extract component logic into reusable functions called Custom Hooks. We will build a useFetch hook from scratch.',
    resources: [
        { name: 'useFetch.js snippet', url: '#' }
    ]
};

const LessonView = () => {
    // const { lessonId } = useParams();
    const [isCompleted, setIsCompleted] = useState(false);

    // In a real app, fetch lesson details
    const lesson = MOCK_LESSON;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6">
                    {/* Navigation Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/student/courses/1" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft size={16} className="mr-1" />
                            Back to Course
                        </Link>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                Previous
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
                                Next Lesson <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Video Player Container */}
                    <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl mb-8 relative group">
                        {/* Placeholder for actual secure video player implementation */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4 mx-auto group-hover:scale-110 transition-transform cursor-pointer">
                                    <Play size={32} className="text-white ml-1" />
                                </div>
                                <p className="text-slate-400 text-sm">Secure Video Stream Player</p>
                            </div>
                        </div>
                        {/* 
                           In production:
                           <video src={lesson.videoUrl} controls className="w-full h-full" />
                        */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">{lesson.title}</h1>
                                <p className="text-sm text-blue-600 font-medium mb-4">{lesson.moduleTitle}</p>
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>{lesson.description}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setIsCompleted(!isCompleted)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    <CheckCircle size={20} />
                                    {isCompleted ? 'Marked as Completed' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="font-semibold text-slate-800 mb-4">Lesson Materials</h3>
                                <ul className="space-y-3">
                                    {lesson.resources.map((resource, idx) => (
                                        <li key={idx}>
                                            <a href={resource.url} className="flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors group">
                                                <Download size={16} className="mr-2 text-slate-400 group-hover:text-blue-600" />
                                                {resource.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
