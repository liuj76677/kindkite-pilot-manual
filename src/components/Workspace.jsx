import React, { useState, useEffect } from 'react';
import { fetchGrant, fetchDraft, fetchOrg, saveDraft } from '../services/api';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Draggable from 'react-draggable';

const ORG_ID = 'tembo-education';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Workspace = ({ selectedGrantId }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [grant, setGrant] = useState(null);
  const [draft, setDraft] = useState(null);
  const [org, setOrg] = useState(null);
  const [draftSections, setDraftSections] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [highlightedSections, setHighlightedSections] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);
  const [polishedDoc, setPolishedDoc] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState(null);
  const [clarificationAnswers, setClarificationAnswers] = useState([]);

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

  useEffect(() => {
    // Automatically polish with AI when user first clicks the 'full' tab and grant/draftSections are loaded
    if (activeTab === 'full' && !polishedDoc && grant && grant.sections && Object.keys(draftSections).length > 0 && !polishing) {
      polishWithAI();
    }
    // Optionally, clear polishedDoc if user edits draftSections in 'draft' tab
    // (Uncomment if you want to force re-polish after edits)
    // if (activeTab === 'draft') setPolishedDoc('');
    // eslint-disable-next-line
  }, [activeTab, grant, draftSections]);

  const handleSectionChange = (label, value) => {
    setDraftSections(prev => ({ ...prev, [label]: value }));
  };

  const handleSaveDraft = async () => {
    if (!selectedGrantId) return;
    setSaving(true);
    await saveDraft(ORG_ID, selectedGrantId, { sections: draftSections });
    setSaving(false);
  };

  const generateAIDraft = async () => {
    if (!selectedGrantId || !org || !grant) return;
    
    setGenerating(true);
    try {
      // Map sections to grantQuestions format
      const grantQuestions = (grant.sections || []).map((section, idx) => ({
        id: section.label?.toLowerCase().replace(/\s+/g, '_') || `section_${idx}`,
        question: section.label,
        guidelines: section.description || ''
      }));
      const response = await axios.post(`${API_BASE_URL}/api/generate-draft-answers`, {
        orgInfo: org,
        grantQuestions
      });
      
      const { answers } = response.data;
      
      // Update draft sections with AI-generated answers
      const newSections = {};
      answers.forEach(({ questionId, answer }) => {
        newSections[questionId] = answer;
        // Highlight sections that need human review
        setHighlightedSections(prev => ({
          ...prev,
          [questionId]: true
        }));
      });
      
      setDraftSections(newSections);
      await handleSaveDraft();
    } catch (error) {
      console.error('Error generating AI draft:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedGrantId || !draftSections) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-pdf`, {
        orgId: ORG_ID,
        grantId: selectedGrantId,
        sections: draftSections,
        grant: grant
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Helper to get prompts from grant.sections
  const getPrompts = () => {
    if (grant?.sections && grant.sections.length > 0) {
      return grant.sections.map((section, idx) => ({
        id: section.label?.toLowerCase().replace(/\s+/g, '_') || `section_${idx}`,
        label: section.label,
        description: section.description || '',
      }));
    }
    return [];
  };

  // Helper to clean up markdown artifacts
  const cleanMarkdown = (text) => {
    if (!text) return '';
    // Remove **bold**, __underline__, ## headers, etc.
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\#\s?(.*)/g, '<strong>$1</strong>')
      .replace(/\n{2,}/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  // Helper to assemble the full document as HTML
  const getFullDocumentHtml = () => {
    if (polishedDoc) {
      // If AI-polished, show that
      return DOMPurify.sanitize(polishedDoc);
    }
    if (!grant?.sections) return '';
    return grant.sections.map((section) => {
      const answer = draftSections[section.label?.toLowerCase().replace(/\s+/g, '_')] || '';
      return `
        <div style='margin-bottom:2em;'>
          <div style='font-size:0.95em;color:#888;margin-bottom:0.5em;'>${section.description || ''}</div>
          <h2 style='margin-top:0.5em;'>${section.label}</h2>
          <div>${cleanMarkdown(answer)}</div>
        </div>
      `;
    }).join('');
  };

  // Polish with AI
  const polishWithAI = async (clarifications = null) => {
    setPolishing(true);
    try {
      const requirements = grant.sections.map(s => ({
        label: s.label,
        description: s.description || ''
      }));
      const answers = grant.sections.map(s => ({
        label: s.label,
        answer: draftSections[s.label?.toLowerCase().replace(/\s+/g, '_')] || ''
      }));
      const response = await axios.post(`${API_BASE_URL}/api/polish-full-document`, {
        requirements,
        answers,
        grantTitle: grant.title,
        orgName: org?.organization || '',
        clarifications
      });
      if (response.data.clarificationQuestions) {
        setClarificationQuestions(response.data.clarificationQuestions);
        setClarificationAnswers(Array(response.data.clarificationQuestions.length).fill(''));
        setPolishing(false);
        return;
      }
      setPolishedDoc(response.data.polishedDocument || '');
      setClarificationQuestions(null);
      setClarificationAnswers([]);
    } catch (err) {
      alert('Failed to polish document with AI.');
    } finally {
      setPolishing(false);
    }
  };

  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    // Save clarifications to org DB
    await axios.post(`${API_BASE_URL}/api/save-clarifications`, {
      orgId: org?.id || 'tembo',
      grantId: grant?.title || '',
      clarifications: clarificationQuestions.map((q, i) => ({ question: q, answer: clarificationAnswers[i] }))
    });
    // Then send to polish endpoint
    await polishWithAI(clarificationQuestions.map((q, i) => ({ question: q, answer: clarificationAnswers[i] })));
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
            { id: 'full', label: 'Full Document', color: 'green' },
            { id: 'chat', label: 'Chat with AI', color: 'yellow' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                `py-4 px-1 border-b-2 font-medium text-sm ` +
                (activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{grant.title}</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600">{grant.summary || grant.description}</p>
              {grant.prompt_type && (
                <p className="text-sm text-gray-700 mt-2"><strong>Prompt Type:</strong> {grant.prompt_type}</p>
              )}
              {grant.prompt_description && (
                <p className="text-sm text-gray-700 mt-2"><strong>Prompt Description:</strong> {grant.prompt_description}</p>
              )}
              <h3 className="text-lg font-semibold mt-4">Requirements</h3>
              <ul className="list-disc list-inside">
                {grant.requirements?.map((req, idx) => (
                  <li key={idx} className="text-gray-600">{req.description}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'draft' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Draft Response</h2>
              <div className="space-x-4">
                <button
                  onClick={generateAIDraft}
                  disabled={generating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate with AI'}
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Export PDF
                </button>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download={`${grant.title}-application.pdf`}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {getPrompts().map((prompt) => (
                <div
                  key={prompt.id}
                  className={`p-4 rounded-lg ${
                    highlightedSections[prompt.id]
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{prompt.label}</h3>
                  {prompt.description && (
                    <p className="text-sm text-gray-600 mb-4">{prompt.description}</p>
                  )}
                  <textarea
                    value={draftSections[prompt.id] || ''}
                    onChange={(e) => handleSectionChange(prompt.id, e.target.value)}
                    className="w-full h-32 p-2 border rounded-lg"
                    placeholder="Enter your response here..."
                  />
                  {highlightedSections[prompt.id] && (
                    <div className="mt-2 text-sm text-yellow-600">
                      This section was generated by AI and may need human review.
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'full' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Document Review</h2>
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                onClick={() => polishWithAI()}
                disabled={polishing}
              >
                {polishing ? 'Polishing with AI...' : 'Re-Polish Full Document with AI'}
              </button>
            </div>
            <div
              className="prose prose-lg min-h-[400px] border rounded p-6 bg-gray-50 focus:outline-none"
              contentEditable
              suppressContentEditableWarning
              style={{ whiteSpace: 'pre-wrap', cursor: 'text' }}
              dangerouslySetInnerHTML={{ __html: getFullDocumentHtml() }}
            />
            <div className="mt-2 text-xs text-gray-500">Highlight text to see AI options (coming soon).</div>
            {clarificationQuestions && (
              <Draggable handle=".modal-header">
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-xl p-6 w-[600px] max-w-full overflow-y-auto max-h-[90vh]">
                    <form onSubmit={handleClarificationSubmit}>
                      <div className="modal-header cursor-move flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[#442e1c]">AI needs more information</h2>
                      </div>
                      {clarificationQuestions.map((q, i) => (
                        <div key={i} className="mb-4">
                          <label className="block font-medium text-[#442e1c] mb-2">{q}</label>
                          <textarea
                            className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                            rows={2}
                            value={clarificationAnswers[i]}
                            onChange={e => setClarificationAnswers(ans => ans.map((a, idx) => idx === i ? e.target.value : a))}
                            required
                          />
                        </div>
                      ))}
                      <div className="text-right">
                        <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">Submit Clarifications</button>
                      </div>
                    </form>
                  </div>
                </div>
              </Draggable>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Chat with AI Assistant</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">
                Chat with our AI assistant to get help with your grant application.
                The assistant has access to your organization's information and can
                provide personalized guidance.
              </p>
              {/* Chat interface will be implemented in the next step */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace; 