import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentLogin from './pages/auth/StudentLogin';
import InstructorLogin from './pages/auth/InstructorLogin';
// import AdminLogin from './pages/auth/AdminLogin';
// import StudentRegister from './pages/auth/StudentRegister';
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
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import MyCohorts from './pages/instructor/CohortsPage';
import CreateCohort from './pages/instructor/CreateCohort';
import EditCohort from './pages/instructor/EditCohort';
import CourseLibrary from './pages/instructor/CourseLibrary';
import CohortDetails from './pages/instructor/CohortDetails';
import Students from './pages/instructor/Students';
import AddStudent from './pages/instructor/AddStudent';
import EditStudent from './pages/instructor/EditStudent';
import StudentDetails from './pages/instructor/StudentDetails';
import LiveClass from './pages/instructor/LiveClass';
import CreateLiveSession from './pages/instructor/CreateLiveSession';
import InstructorAssignments from './pages/instructor/assignments/Assignments.tsx';
import CreateAssignment from './pages/instructor/assignments/CreateAssignment.tsx';
import AssignmentSubmissions from './pages/instructor/assignments/AssignmentSubmissions.tsx';
import StudentAssignments from './pages/student/assignments/Assignments.tsx';
import SubmitAssignment from './pages/student/assignments/SubmitAssignment.tsx';
import NotFound from './pages/NotFound';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
import InstructorChannelsPage from './pages/instructor/InstructorChannelsPage';
import InstructorChannelPage from './pages/instructor/InstructorChannelPage';
import InstructorSettings from './pages/instructor/Settings';
import StudentChannelsPage from './pages/student/StudentChannelsPage';
import StudentChannelPage from './pages/student/StudentChannelPage';
import InstructorInterviews from './pages/instructor/interviews/Interviews';
import CreateInterview from './pages/instructor/interviews/CreateInterview';
import EditInterview from './pages/instructor/interviews/EditInterview';
import StudentInterviews from './pages/student/interviews/Interviews';
import CertificateTemplateManager from './pages/instructor/CertificateTemplateManager';
import ActivityLogsDetailed from './pages/instructor/ActivityLogsDetailed';
import CertificateVerification from './pages/CertificateVerification';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

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
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<StudentLogin />} />
            {/* <Route path="/register" element={<StudentRegister />} /> */}
            <Route path="/instructor-login" element={<InstructorLogin />} />
            {/* <Route path="/admin-login" element={<AdminLogin />} /> */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify/:uuid" element={<CertificateVerification />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<Courses />} />
                <Route path="/student/courses/:courseId" element={<CourseDetails />} />
                <Route path="/student/courses/:courseId/lesson/:lessonId" element={<LessonView />} />
                <Route path="/student/live" element={<Live />} />
                <Route path="/student/account" element={<Account />} />
                <Route path="/student/channels" element={<StudentChannelsPage />} />
                <Route path="/student/courses/:courseId/channel" element={<StudentChannelPage />} />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                <Route path="/student/assignments/:id/submit" element={<SubmitAssignment />} />
                <Route path="/student/interview" element={<StudentInterviews />} />
                {/* Redirect legacy dashboard route if needed, or just keep /student/dashboard as main */}
                <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route element={<InstructorLayout />}>
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
                <Route path="/instructor/cohorts" element={<MyCohorts />} />
                <Route path="/instructor/cohorts/create" element={<CreateCohort />} />
                <Route path="/instructor/cohorts/:id" element={<CohortDetails />} />
                <Route path="/instructor/cohorts/:id/edit" element={<EditCohort />} />
                <Route path="/instructor/cohorts/:id/attach-course" element={<CreateCourse />} />
                <Route path="/instructor/courses/:id/edit" element={<EditCourse />} />
                <Route path="/instructor/course-library" element={<CourseLibrary />} />
                <Route path="/instructor/course-library/create" element={<CreateCourse />} />

                {/* Legacy Redirection Support */}
                <Route path="/instructor/courses" element={<Navigate to="/instructor/cohorts" replace />} />

                <Route path="/instructor/students" element={<Students />} />
                <Route path="/instructor/students/add" element={<AddStudent />} />
                <Route path="/instructor/students/:id" element={<StudentDetails />} />
                <Route path="/instructor/students/:id/edit" element={<EditStudent />} />
                <Route path="/instructor/assignments" element={<InstructorAssignments />} />
                <Route path="/instructor/assignments/create" element={<CreateAssignment />} />
                <Route path="/instructor/assignments/:id/submissions" element={<AssignmentSubmissions />} />
                <Route path="/instructor/live" element={<LiveClass />} />
                <Route path="/instructor/live/create" element={<CreateLiveSession />} />
                <Route path="/instructor/channels" element={<InstructorChannelsPage />} />
                <Route path="/instructor/courses/:courseId/channel" element={<InstructorChannelPage />} />
                <Route path="/instructor/interview" element={<InstructorInterviews />} />
                <Route path="/instructor/interviews/create" element={<CreateInterview />} />
                <Route path="/instructor/interviews/edit/:id" element={<EditInterview />} />
                <Route path="/instructor/settings" element={<InstructorSettings />} />
                <Route path="/instructor/activity-logs" element={<ActivityLogsDetailed />} />
                <Route path="/instructor/courses/:courseId/certificate-design" element={<CertificateTemplateManager />} />
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
