import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import LiveInterviewPage from './pages/LiveInterviewPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import FutureModulesPage from './pages/FutureModulesPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import CodingInterviewPage from './pages/CodingInterviewPage';
import AptitudePracticePage from './pages/AptitudePracticePage';

// Pages that show Navbar and Footer
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

// Pages that show only Navbar (no footer)
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// Live interview — fullscreen, no nav
const FullscreenLayout = ({ children }) => <>{children}</>;

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#E2E8F0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22C55E', secondary: '#0A0E1A' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#0A0E1A' } },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><DashboardPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/interview/setup" element={
              <ProtectedRoute>
                <AppLayout><InterviewSetupPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/interview/live" element={
              <ProtectedRoute>
                <FullscreenLayout><LiveInterviewPage /></FullscreenLayout>
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
              <ProtectedRoute>
                <AppLayout><ResultPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <AppLayout><HistoryPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/modules" element={
              <ProtectedRoute>
                <AppLayout><FutureModulesPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/resume-analyzer" element={
              <ProtectedRoute>
                <AppLayout><ResumeAnalyzerPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/coding-interview" element={
              <ProtectedRoute>
                <AppLayout><CodingInterviewPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/aptitude-practice" element={
              <ProtectedRoute>
                <AppLayout><AptitudePracticePage /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
