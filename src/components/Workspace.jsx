import React, { useState, useEffect } from 'react';
import { fetchGrant, fetchDraft, fetchOrg, saveDraft } from '../services/api';

const ORG_ID = 'tembo-education';

const Workspace = ({ selectedGrantId }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [grant, setGrant] = useState(null);
  const [draft, setDraft] = useState(null);
  const [org, setOrg] = useState(null);
  const [draftSections, setDraftSections] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedGrantId) {
      fetchGrant(selectedGrantId).then(setGrant);
      fetchDraft(ORG_ID, selectedGrantId).then(d => {
        setDraft(d);
        setDraftSections(d.sections || {});
      }).catch(() => {
        setDraft(null);
        setDraftSections({});
      });
      fetchOrg(ORG_ID).then(setOrg);
    } else {
      setGrant(null);
      setDraft(null);
      setOrg(null);
      setDraftSections({});
    }
  }, [selectedGrantId]);

  const handleSectionChange = (label, value) => {
    setDraftSections(prev => ({ ...prev, [label]: value }));
  };

  const handleSaveDraft = async () => {
    if (!selectedGrantId) return;
    setSaving(true);
    await saveDraft(ORG_ID, selectedGrantId, { sections: draftSections });
    setSaving(false);
  };

  if (!selectedGrantId) {
    return <div className="flex items-center justify-center h-full text-gray-400">Select a grant to get started.</div>;
  }
  if (!grant) return <div className="p-6">Loading grant details...</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'summary', label: 'Grant Summary', color: 'purple' },
            { id: 'draft', label: 'Draft Response', color: 'blue' },
            { id: 'chat', label: 'Chat with AI', color: 'yellow' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{grant.title}</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Educational Brief</h3>
              <p className="text-gray-700 mb-2">{grant.summary}</p>
              <div className="text-sm text-gray-500 mb-2">Deadline: {grant.deadline} | Funder: {grant.funder}</div>
              <div className="text-sm text-gray-500 mb-2">Effort: {grant.effort} | Chance of Success: {grant.chance_of_success}</div>
              <div className="text-sm text-gray-500 mb-2">Why: {grant.why}</div>
              <div className="mt-4">
                <span className="font-semibold">Prompt:</span> {grant.prompt_description}
              </div>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Summarize Again
              </button>
            </div>
            {org && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-1">About {org.name}</h4>
                <div className="text-sm text-gray-700">{org.overview}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'draft' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Draft Response</h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {grant.sections.map((section) => (
                <div key={section.label} className="mb-6">
                  <label className="block font-semibold mb-1">{section.label}</label>
                  <div className="text-xs text-gray-500 mb-1">{section.description}</div>
                  <textarea
                    className="w-full h-28 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Draft your response for ${section.label}...`}
                    value={draftSections[section.label] || ''}
                    onChange={e => handleSectionChange(section.label, e.target.value)}
                  />
                  {/* Future: Add "Ask AI to Rewrite" button here */}
                </div>
              ))}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Chat with AI</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded-md p-4">
                {/* Chat messages will go here */}
                <p className="text-gray-600">Start a conversation with the AI assistant...</p>
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Type your message..."
                  disabled
                />
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700" disabled>
                  Send
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2">(AI chat coming soon)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace; 