import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GrantApplication from '../components/GrantApplication';

export default function GrantDashboard() {
  const { orgId, grantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Prefer state, fallback to null (could add fetch logic here if needed)
  const org = location.state?.org || null;
  const grant = location.state?.grant || null;
  const [accepted, setAccepted] = useState(false);

  if (!org || !grant) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#442e1c]">Grant Not Found</h2>
        <p className="mb-4 text-[#5e4633]">We couldn't find the grant or organization information. Please return to your dashboard and try again.</p>
        <button
          className="px-6 py-2 bg-[#3d6b44] text-white rounded-lg"
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="mb-6 px-4 py-2 bg-[#f2e4d5] text-[#442e1c] rounded-lg hover:bg-[#e5d3b3]"
        onClick={() => navigate(-1)}
      >
        ← Back to {org.organization} Dashboard
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#442e1c] mb-2">{grant.name || grant.title}</h1>
        <p className="text-lg text-[#5e4633] italic mb-2">{grant.funder}</p>
        <div className="bg-orange-50 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-orange-800 mb-2">Grant Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><strong>Deadline:</strong> {grant.deadline}</p>
            <p><strong>Funding:</strong> {grant.funding}</p>
            <p><strong>Effort:</strong> {grant.effort || grant.effort_level?.rating}</p>
            <p><strong>Eligibility:</strong> {grant.eligibility}</p>
          </div>
          <div className="mt-2 text-[#5e4633]">{grant.match}</div>
        </div>
      </header>

      {/* Accept requirements step */}
      {!accepted && grant.requirements && grant.requirements.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2 text-[#442e1c]">Grant Requirements</h3>
          <ul className="list-disc list-inside mb-4">
            {grant.requirements.map((req, idx) => (
              <li key={idx} className="mb-1 text-[#5e4633]">{req.description || req}</li>
            ))}
          </ul>
          <button
            className="px-6 py-2 bg-[#3d6b44] text-white rounded-lg"
            onClick={() => setAccepted(true)}
          >
            I Accept These Requirements
          </button>
        </div>
      )}

      {/* Grant application Q&A */}
      {(accepted || !grant.requirements || grant.requirements.length === 0) && (
        <div className="mt-8">
          <GrantApplication grant={grant} organization={org} />
        </div>
      )}
    </div>
  );
} 