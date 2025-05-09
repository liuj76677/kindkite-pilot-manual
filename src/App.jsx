import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrgDashboard from './pages/OrgDashboard';
import OrgPage from './components/OrgPage';
import AdminGrantManager from './components/AdminGrantManager';
import PilotV0 from './pages/PilotV0';
import AdminFeedback from './pages/AdminFeedback';
import AdminAnalytics from './pages/AdminAnalytics';
import Landing from './pages/Landing';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] via-[#f8dfc3] to-[#f2e4d5]">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/dashboard" element={<OrgDashboard />} />
          <Route path="/org/:orgId" element={<OrgPage />} />
          <Route path="/admin/grants" element={<AdminGrantManager />} />
          <Route path="/pilot" element={<PilotV0 />} />
          <Route path="/pilot/:organizationId" element={<PilotV0 />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
