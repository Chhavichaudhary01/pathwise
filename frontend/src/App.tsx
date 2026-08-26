import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import RoadmapView from './pages/RoadmapView';
import SkillGraphView from './pages/SkillGraphView';
import PortfolioView from './pages/PortfolioView';
import ChatView from './pages/ChatView';
import SettingsView from './pages/SettingsView';
import PublicVerification from './pages/PublicVerification';
import FloatingAIAssistant from './components/FloatingAIAssistant';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:uuid" element={<PublicVerification />} />
        <Route path="/verify" element={<PublicVerification />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapView /></ProtectedRoute>} />
        <Route path="/roadmap/:id" element={<ProtectedRoute><RoadmapView /></ProtectedRoute>} />
        <Route path="/skill-graph" element={<ProtectedRoute><SkillGraphView /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><PortfolioView /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatView /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <FloatingAIAssistant />}
    </Router>
  );
}

export default App;
