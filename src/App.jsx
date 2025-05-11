import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PilotV0 from './pages/PilotV0';
import OrgDashboard from './pages/OrgDashboard';
import GrantDashboard from './pages/GrantDashboard';
import AdminFeedback from './pages/AdminFeedback';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pilot" element={<PilotV0 />} />
        <Route path="/pilot/:organizationId" element={<PilotV0 />} />
        <Route path="/org" element={<OrgDashboard />} />
        <Route path="/org/:orgId" element={<OrgDashboard />} />
        <Route path="/org/:orgId/grant/:grantId" element={<GrantDashboard />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/dashboard" element={<Layout />} />
      </Routes>
    </div>
  );
}

export default App;
