import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import data from '../data/pilot_data.json';
import GrantCard from './GrantCard';
import { rankGrants } from '../services/grantAnalysis';

export default function OrgPage() {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [rankedGrants, setRankedGrants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logs for initial data
  console.log('Available data:', {
    orgId,
    allOrgs: data,
    availableOrgIds: data.map(o => o.id)
  });

  useEffect(() => {
    console.log("Looking for org:", orgId);
    console.log("Available orgs:", data.map(o => o.id));
    
    const foundOrg = data.find((o) => o.id === orgId);
    console.log("Matched org:", foundOrg);
    console.log("Grant recommendations:", foundOrg?.grant_recommendations);
    
    setOrg(foundOrg);
  }, [orgId]);

  useEffect(() => {
    async function analyzeGrants() {
      if (!org) return;

      try {
        console.log("Starting grant analysis for:", {
          orgName: org.organization,
          grantsCount: org.grant_recommendations?.length,
          grants: org.grant_recommendations
        });

        if (!org.grant_recommendations?.length) {
          console.log("No grants available for analysis");
          setError("No grants available for analysis");
          setLoading(false);
          return;
        }

        const analysis = await rankGrants(org, org.grant_recommendations);
        console.log("Analysis result:", {
          success: analysis.success,
          topGrantsCount: analysis.top_grants?.length,
          totalAnalyzed: analysis.total_analyzed,
          successfulAnalyses: analysis.successful_analyses,
          result: analysis
        });

        if (!analysis.success || !analysis.top_grants?.length) {
          throw new Error("Failed to rank grants. Please try again.");
        }

        setRankedGrants(analysis);
        setError(null);
      } catch (err) {
        console.error("Error analyzing grants:", err);
        setError(err.message || "Failed to analyze grants. Please try again.");
        setRankedGrants(null);
      } finally {
        setLoading(false);
      }
    }
    
    setLoading(true);
    analyzeGrants();
  }, [org]);

  // Debug log before render
  console.log("Render state:", {
    hasOrg: !!org,
    orgName: org?.organization,
    grantsCount: org?.grant_recommendations?.length,
    hasRankedGrants: !!rankedGrants?.top_grants,
    rankedGrantsCount: rankedGrants?.top_grants?.length,
    successfulAnalyses: rankedGrants?.successful_analyses,
    isLoading: loading,
    error
  });

  if (!org) return (
    <div className="p-6">
      <p className="text-red-600">Organization not found: {orgId}</p>
      <p className="text-sm text-gray-500 mt-2">Available organizations: {data.map(o => o.id).join(', ')}</p>
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
            <div className="text-sm text-gray-500 animate-pulse">
              Analyzing best matches...
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (!rankedGrants?.top_grants || rankedGrants.top_grants.length === 0) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 italic">
              No grant recommendations available at the moment.
              {org.grant_recommendations?.length > 0 ? 
                " Analysis is still processing..." : 
                " No grants found for analysis."}
            </p>
          </div>
        )}

        {/* Debug info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-mono">
            Debug Info:<br />
            Grants available: {org.grant_recommendations?.length || 0}<br />
            Ranked grants: {rankedGrants?.top_grants?.length || 0}<br />
            Loading: {loading ? 'Yes' : 'No'}<br />
            Error: {error || 'None'}
          </p>
        </div>

        {rankedGrants?.top_grants?.map((rankedGrant, index) => {
          const grant = org.grant_recommendations?.find(g => g.title === rankedGrant.grant_title);
          if (!grant) {
            console.warn(`Grant not found: ${rankedGrant.grant_title}`);
            return null;
          }

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
        })}

        {/* Fallback to unranked grants if ranking fails */}
        {!rankedGrants?.top_grants && !loading && org.grant_recommendations?.length > 0 && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-600">
                Showing unranked grant recommendations while analysis completes...
              </p>
            </div>
            {org.grant_recommendations.map((grant, index) => (
              <GrantCard 
                key={index} 
                grant={grant} 
                organization={org}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
