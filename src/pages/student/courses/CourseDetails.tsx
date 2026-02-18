import { Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Clock, Download } from 'lucide-react';

const MOCK_COURSE_DETAILS = {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'Sarah Wilson',
    description: 'Master modern React concepts including Hooks, Context, Reducers, and Performance Optimization. Build real-world applications with best practices.',
    progress: 45,
    modules: [
        {
            id: 1,
            title: 'Modern React Fundamentals',
            lessons: [
                { id: 101, title: 'Introduction to Hooks', duration: '15:20', type: 'video', isCompleted: true },
                { id: 102, title: 'useEffect Deep Dive', duration: '22:15', type: 'video', isCompleted: true },
                { id: 103, title: 'Custom Hooks', duration: '18:40', type: 'video', isCompleted: false },
            ]
        },
        {
            id: 2,
            title: 'State Management',
            lessons: [
                { id: 201, title: 'Context API vs Redux', duration: '25:00', type: 'video', isCompleted: false },
                { id: 202, title: 'Zustand Implementation', duration: '19:30', type: 'video', isCompleted: false },
            ]
        }
    ],
    resources: [
        { id: 1, title: 'Course Syllabus.pdf', size: '2.5 MB' },
        { id: 2, title: 'Project Starter Code.zip', size: '15 MB' }
    ]
};

const CourseDetails = () => {
    // const { courseId } = useParams();
    const course = MOCK_COURSE_DETAILS;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Link to="/student/courses" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft size={16} className="mr-1" /> Back to Courses
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Course Info & Curriculum */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
                        <p className="text-slate-500 mb-4">Instructor: {course.instructor}</p>
                        <p className="text-slate-600 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Progress */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-blue-900">Your Progress</span>
                            <span className="text-blue-700 font-bold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                        </div>
                    </div>

                    {/* Modules Accordion */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Course Curriculum</h2>
                        {course.modules.map((module) => (
                            <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 font-medium text-slate-800 flex justify-between items-center">
                                    <span>{module.title}</span>
                                    <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{module.lessons.length} Lessons</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {module.lessons.map((lesson) => (
                                        <Link
                                            key={lesson.id}
                                            to={`/student/lesson/${lesson.id}`}
                                            className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {lesson.isCompleted ? (
                                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <PlayCircle size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`text-sm font-medium ${lesson.isCompleted ? 'text-slate-500 line-through' : 'text-slate-700 group-hover:text-blue-700'}`}>
                                                        {lesson.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-400">
                                                <Clock size={14} className="mr-1" />
                                                {lesson.duration}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Resources & Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4">Course Resources</h3>
                        <div className="space-y-3">
                            {course.resources.map((resource) => (
                                <a
                                    key={resource.id}
                                    href="#"
                                    className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-all group"
                                >
                                    <FileText size={20} className="text-slate-400 group-hover:text-blue-500 mr-3" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{resource.title}</p>
                                        <p className="text-xs text-slate-400">{resource.size}</p>
                                    </div>
                                    <Download size={16} className="text-slate-300 group-hover:text-blue-500" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
