import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentLogin from './pages/auth/StudentLogin';
import InstructorLogin from './pages/auth/InstructorLogin';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './student/dashboard/Dashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Courses from './student/courses/Courses';
import CourseDetails from './student/courses/CourseDetails';
import LessonView from './student/courses/LessonView';
import Live from './student/live/Live';
import Account from './student/account/Account';
import StudentLayout from './student/layout/StudentLayout';
import InstructorLayout from './components/layouts/InstructorLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
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
            <Route path="/instructor-login" element={<InstructorLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
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
                {/* Redirect legacy dashboard route if needed, or just keep /student/dashboard as main */}
                <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
              </Route>
            </Route>

            {/* Instructor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route element={<InstructorLayout />}>
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>404 Not Found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
