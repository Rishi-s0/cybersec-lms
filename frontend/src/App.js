import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Roadmap from './pages/Roadmap';
import Tools from './pages/Tools';
import ThreatMap from './pages/ThreatMap';
import Labs from './pages/Labs';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import OAuthCallback from './pages/OAuthCallback';
import SearchResults from './pages/SearchResults';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyber-500 mx-auto mb-4"></div>
          <div className="text-slate-300 font-medium text-lg">
            Loading<span className="loading-dots"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <ScrollProgress />
        <Navbar />
        <NotificationToast />
        <main className="flex-1 container mx-auto px-4 py-8 relative z-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route
              path="/login"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Login />}
            />
            <Route
              path="/register"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Register />}
            />
            <Route
              path="/forgot-password"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <ResetPassword />}
            />
            <Route
              path="/verify-email"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <EmailVerification />}
            />
            <Route
              path="/dashboard"
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard />) : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />}
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lesson/:lessonId" element={<LessonViewer />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/threat-map" element={<ThreatMap />} />
            <Route path="/labs" element={<Labs />} />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route
              path="/certificates"
              element={user ? <Certificates /> : <Navigate to="/login" />}
            />
            <Route
              path="/certificate-view/:id"
              element={user ? <CertificateView /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;