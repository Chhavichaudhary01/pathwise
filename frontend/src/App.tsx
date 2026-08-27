import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardMyTask from './pages/DashboardMyTask';
import DashboardCoursue from './pages/DashboardCoursue';
import Onboarding from './pages/Onboarding';
import RoadmapView from './pages/RoadmapView';
import SkillGraphView from './pages/SkillGraphView';
import PortfolioView from './pages/PortfolioView';
import ChatView from './pages/ChatView';
import SettingsView from './pages/SettingsView';
import PublicVerification from './pages/PublicVerification';
import ResourceFinder from './pages/ResourceFinder';
import ResumeAnalyzerView from './pages/ResumeAnalyzerView';
import CareerPlannerView from './pages/CareerPlannerView';
import PublicPortfolioView from './pages/PublicPortfolioView';
import ResourceGuideView from './pages/ResourceGuideView';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children }: { children?: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children ? children : <AppLayout />;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:uuid" element={<PublicVerification />} />
        <Route path="/verify" element={<PublicVerification />} />
        <Route path="/@:username" element={<PublicPortfolioView />} />
        <Route path="/p/:username" element={<PublicPortfolioView />} />
        <Route path="/portfolio/:username" element={<PublicPortfolioView />} />

        {/* Authenticated Protected Routes with Persistent AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<RoadmapView />} />
          <Route path="/my-task" element={<DashboardMyTask />} />
          <Route path="/coursue" element={<DashboardCoursue />} />
          <Route path="/lms" element={<DashboardCoursue />} />
          <Route path="/roadmap" element={<RoadmapView />} />
          <Route path="/roadmap/:id" element={<RoadmapView />} />
          <Route path="/learn" element={<ResourceGuideView />} />
          <Route path="/learn/:topicSlug" element={<ResourceGuideView />} />
          <Route path="/resource-guide" element={<ResourceGuideView />} />
          <Route path="/planner" element={<CareerPlannerView />} />
          <Route path="/schedule" element={<CareerPlannerView />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzerView />} />
          <Route path="/resume" element={<ResumeAnalyzerView />} />
          <Route path="/resources" element={<ResourceFinder />} />
          <Route path="/skill-graph" element={<SkillGraphView />} />
          <Route path="/portfolio" element={<PortfolioView />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <FloatingAIAssistant />}
    </Router>
  );
}

export default App;
