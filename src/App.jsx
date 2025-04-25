import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrgDashboard from './pages/OrgDashboard';
import OrgPage from './components/OrgPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] via-[#f8dfc3] to-[#f2e4d5]">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<OrgDashboard />} />
          <Route path="/org/:orgId" element={<OrgPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
