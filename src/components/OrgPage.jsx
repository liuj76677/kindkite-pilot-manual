import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import data from '../data/pilot_data.json';
import GrantCard from './GrantCard';
import { rankGrants } from '../services/grantAnalysis';

export default function OrgPage() {
  const { orgId } = useParams();
  const org = data.find((o) => o.id === orgId);
  const [rankedGrants, setRankedGrants] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzeGrants() {
      if (org) {
        const analysis = await rankGrants(org, org.grant_recommendations);
        setRankedGrants(analysis);
        setLoading(false);
      }
    }
    analyzeGrants();
  }, [org]);

  if (!org) return (
    <div className="p-6">
      <p className="text-red-600">Organization not found.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{org.organization}</h1>
        <p className="text-lg text-gray-600 italic mb-4">{org.mission}</p>
        <div className="bg-orange-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-orange-800 mb-2">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><strong>Contact:</strong> {org.contact.name}</p>
            <p><strong>Email:</strong> {org.contact.email}</p>
            <p><strong>Website:</strong> {org.contact.website}</p>
            <p><strong>Country:</strong> {org.country}</p>
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Top Grant Recommendations</h2>
          {loading && (
            <div className="text-sm text-gray-500">
              Analyzing best matches...
            </div>
          )}
        </div>

        {rankedGrants?.top_grants?.map((rankedGrant, index) => {
          const grant = org.grant_recommendations.find(g => g.title === rankedGrant.grant_title);
          if (!grant) return null;

          return (
            <div key={index} className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-semibold text-sm">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-500">
                  Match Score: {rankedGrant.score}%
                </span>
              </div>
              <GrantCard 
                grant={grant} 
                organization={org}
                rankInfo={rankedGrant}
              />
            </div>
          );
        }) || org.grant_recommendations.map((grant, index) => (
          <GrantCard 
            key={index} 
            grant={grant} 
            organization={org}
          />
        ))}
      </section>
    </div>
  );
}
