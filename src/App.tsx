import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentLogin from './pages/auth/StudentLogin';
import InstructorLogin from './pages/auth/InstructorLogin';
// import AdminLogin from './pages/auth/AdminLogin';
import StudentRegister from './pages/auth/StudentRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/Dashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Courses from './pages/student/courses/Courses';
import CourseDetails from './pages/student/courses/CourseDetails';
import LessonView from './pages/student/courses/LessonView';
import Live from './pages/student/live/Live';
import Account from './pages/student/account/Account';
import StudentLayout from './pages/student/layout/StudentLayout';
import InstructorLayout from './components/layouts/InstructorLayout';
import MyCourses from './pages/instructor/MyCourses';
import CreateCourse from './pages/instructor/CreateCourse';
import Students from './pages/instructor/Students';
import Revenue from './pages/instructor/Revenue';
import LiveClass from './pages/instructor/LiveClass';
import CreateLiveSession from './pages/instructor/CreateLiveSession';
import InstructorCourseDetails from './pages/instructor/CourseDetails';
import NotFound from './pages/NotFound';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
import CurriculumBuilder from './pages/instructor/CurriculumBuilder';
import InstructorChannelsPage from './pages/instructor/InstructorChannelsPage';
import InstructorChannelPage from './pages/instructor/InstructorChannelPage';
import StudentChannelsPage from './pages/student/StudentChannelsPage';
import StudentChannelPage from './pages/student/StudentChannelPage';
import { useState, useEffect } from 'react';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Preloader />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/instructor-login" element={<InstructorLogin />} />
            {/* <Route path="/admin-login" element={<AdminLogin />} /> */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<Courses />} />
                <Route path="/student/courses/:courseId" element={<CourseDetails />} />
                <Route path="/student/lesson/:lessonId" element={<LessonView />} />
                <Route path="/student/live" element={<Live />} />
                <Route path="/student/account" element={<Account />} />
                <Route path="/student/channels" element={<StudentChannelsPage />} />
                <Route path="/student/courses/:courseId/channel" element={<StudentChannelPage />} />
                {/* Redirect legacy dashboard route if needed, or just keep /student/dashboard as main */}
                <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route element={<InstructorLayout />}>
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
                <Route path="/instructor/courses" element={<MyCourses />} />
                <Route path="/instructor/courses/create" element={<CreateCourse />} />
                <Route path="/instructor/students" element={<Students />} />
                <Route path="/instructor/revenue" element={<Revenue />} />
                <Route path="/instructor/live" element={<LiveClass />} />
                <Route path="/instructor/live/create" element={<CreateLiveSession />} />
                <Route path="/instructor/courses/:id/curriculum" element={<CurriculumBuilder />} />
                <Route path="/instructor/courses/:id" element={<InstructorCourseDetails />} />
                <Route path="/instructor/channels" element={<InstructorChannelsPage />} />
                <Route path="/instructor/courses/:courseId/channel" element={<InstructorChannelPage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
