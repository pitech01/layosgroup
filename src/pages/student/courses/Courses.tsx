import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_COURSES = [
    {
        id: 1,
        title: 'Advanced React Development',
        instructor: 'Sarah Wilson',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 45,
        totalLessons: 24,
        completedLessons: 11,
    },
    {
        id: 2,
        title: 'UI/UX Design Masterclass',
        instructor: 'Michael Chen',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 10,
        totalLessons: 18,
        completedLessons: 2,
    },
    {
        id: 3,
        title: 'Full Stack Web Development',
        instructor: 'Emma Davis',
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 0,
        totalLessons: 42,
        completedLessons: 0,
    }
];

const Courses = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">My Enrolled Courses</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_COURSES.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-slate-700">
                                {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">Instructor: {course.instructor}</p>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <Link
                                to={`/student/courses/${course.id}`}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
