import React from 'react';
import { Link } from 'react-router-dom';
import data from '../data/pilot_data.json';

const OrgDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Pilot Organization Dashboard</h1>
      <p className="mb-4 text-gray-600">Click your organization to view your top 3 recommended grants.</p>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((org) => (
          <li key={org.id} className="bg-white shadow-md rounded-lg p-4 border hover:border-orange-500 transition">
            <Link to={`/org/${org.id}`} className="text-lg font-semibold text-orange-700 hover:underline">
              {org.organization}
            </Link>
            <p className="text-sm text-gray-600">{org.contact.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrgDashboard;
