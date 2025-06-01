import React, { useState, useEffect, useRef } from 'react';
import { fetchGrant, fetchDraft, fetchOrg, saveDraft } from '../services/api';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Draggable from 'react-draggable';
import './notionDoc.css';

const ORG_ID = 'tembo-education';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BACKEND_API_URL = 'https://kindkite-backend.onrender.com'; // Update to your backend URL

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
  const [clarificationPanelOpen, setClarificationPanelOpen] = useState(false);
  const clarificationPanelRef = useRef();
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [clarificationMessage, setClarificationMessage] = useState('');

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
      fetchOrg(ORG_ID).then(fetchedOrg => {
        // Ensure org.id is always set
        const orgWithId = { ...fetchedOrg };
        if (!orgWithId.id) orgWithId.id = ORG_ID;
        setOrg(orgWithId);
        // Debug log
        console.log('Fetched org:', orgWithId);
      });
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

  useEffect(() => {
    // Show the modal if there are clarification questions and the panel is not open
    if (clarificationQuestions && clarificationQuestions.length > 0) {
      setShowClarificationModal(true);
      setClarificationPanelOpen(false);
    } else {
      setShowClarificationModal(false);
    }
  }, [clarificationQuestions]);

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

  // Helper to remove leading/trailing <br> and empty <p> tags
  const trimHtmlWhitespace = (html) => {
    if (!html) return '';
    // Remove leading/trailing <br> tags
    html = html.replace(/^(<br\s*\/?>)+/i, '');
    html = html.replace(/(<br\s*\/?>)+$/i, '');
    // Remove leading/trailing empty <p> tags
    html = html.replace(/^(<p>\s*<\/p>)+/i, '');
    html = html.replace(/(<p>\s*<\/p>)+$/i, '');
    return html;
  };

  // Helper to assemble the full document as HTML
  const getFullDocumentHtml = () => {
    if (polishedDoc) {
      // If AI-polished, show that
      return DOMPurify.sanitize(polishedDoc);
    }
    if (!grant?.sections) return '';
    return `
      <div class="notion-doc">
        <h1>${grant.title}</h1>
        ${grant.sections.map((section, idx) => {
          let answer = cleanMarkdown(draftSections[section.label?.toLowerCase().replace(/\s+/g, '_')] || '');
          answer = trimHtmlWhitespace(answer);
          return `
            <section>
              <h2>${section.label}</h2>
              ${section.description ? `<div class="notion-desc">${cleanMarkdown(section.description)}</div>` : ''}
              <p>${answer}</p>
              ${idx < grant.sections.length - 1 ? '<hr />' : ''}
            </section>
          `;
        }).join('')}
      </div>
    `;
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
      // Parse the polished document and update draft sections
      const polishedSections = response.data.polishedDocument.split('<h2 style=\'margin-top:0.5em;\'>');
      const newDraftSections = { ...draftSections };
      
      polishedSections.forEach((section, index) => {
        if (index === 0) return; // Skip the first split which is before any h2
        const [title, ...contentParts] = section.split('</h2>');
        const content = contentParts.join('</h2>').split('<div style=\'margin-bottom:2em;\'>')[0];
        
        // Find matching section in grant.sections
        const matchingSection = grant.sections.find(s => s.label === title.trim());
        if (matchingSection) {
          const sectionKey = matchingSection.label?.toLowerCase().replace(/\s+/g, '_');
          if (sectionKey) {
            // Clean up the content (remove HTML tags)
            const cleanContent = content
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
              .trim();
            newDraftSections[sectionKey] = cleanContent;
          }
        }
      });
      
      setDraftSections(newDraftSections);
      // Save the updated draft
      await handleSaveDraft();
      
      setClarificationQuestions(null);
      setClarificationAnswers([]);
      setClarificationMessage('Draft updated successfully!');
      setTimeout(() => setClarificationMessage(''), 2000);
      setShowClarificationModal(false);
      setClarificationPanelOpen(false);
    } catch (err) {
      alert('Failed to polish document with AI.');
    } finally {
      setPolishing(false);
    }
  };

  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    setClarificationSubmitting(true);
    setClarificationMessage('');
    try {
      // Save clarifications to org DB (backend)
      const orgIdToSend = org?.id || org?.orgId || ORG_ID || 'tembo-education';
      await axios.post(`${BACKEND_API_URL}/api/save-clarifications`, {
        orgId: orgIdToSend,
        grantId: grant?.title || '',
        clarifications: clarificationQuestions.map((q, i) => ({ question: q, answer: clarificationAnswers[i] }))
      });
      setClarificationMessage('Clarifications saved! AI is updating your draft...');
      // Then send to polish endpoint
      setPolishing(true);
      const response = await axios.post(`${API_BASE_URL}/api/polish-full-document`, {
        requirements: grant.sections.map(s => ({ label: s.label, description: s.description || '' })),
        answers: grant.sections.map(s => ({ label: s.label, answer: draftSections[s.label?.toLowerCase().replace(/\s+/g, '_')] || '' })),
        grantTitle: grant.title,
        orgName: org?.organization || org?.name || '',
        clarifications: clarificationQuestions.map((q, i) => ({ question: q, answer: clarificationAnswers[i] }))
      });
      if (response.data.clarificationQuestions) {
        setClarificationQuestions(response.data.clarificationQuestions);
        setClarificationAnswers(Array(response.data.clarificationQuestions.length).fill(''));
        setClarificationMessage('More information is needed. Please answer the new questions.');
        setPolishing(false);
        setClarificationSubmitting(false);
        return;
      }
      if (response.data.polishedDocument) {
        setPolishedDoc(response.data.polishedDocument || '');
        // Parse the polished document and update draft sections
        const polishedSections = response.data.polishedDocument.split('<h2 style=\'margin-top:0.5em;\'>');
        const newDraftSections = { ...draftSections };
        
        polishedSections.forEach((section, index) => {
          if (index === 0) return; // Skip the first split which is before any h2
          const [title, ...contentParts] = section.split('</h2>');
          const content = contentParts.join('</h2>').split('<div style=\'margin-bottom:2em;\'>')[0];
          
          // Find matching section in grant.sections
          const matchingSection = grant.sections.find(s => s.label === title.trim());
          if (matchingSection) {
            const sectionKey = matchingSection.label?.toLowerCase().replace(/\s+/g, '_');
            if (sectionKey) {
              // Clean up the content (remove HTML tags)
              const cleanContent = content
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                .trim();
              newDraftSections[sectionKey] = cleanContent;
            }
          }
        });
        
        setDraftSections(newDraftSections);
        // Save the updated draft
        await handleSaveDraft();
        
        setClarificationQuestions(null);
        setClarificationAnswers([]);
        setClarificationMessage('Draft updated successfully!');
        setTimeout(() => setClarificationMessage(''), 2000);
        setShowClarificationModal(false);
        setClarificationPanelOpen(false);
      }
    } catch (err) {
      let msg = 'Failed to save clarifications.';
      if (err.response && err.response.data && err.response.data.error) {
        msg += ' ' + err.response.data.error;
      }
      setClarificationMessage(msg);
      alert(msg);
      console.error('Clarification submit error:', err);
    } finally {
      setClarificationSubmitting(false);
      setPolishing(false);
    }
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
              className="prose prose-lg min-h-[400px] border rounded p-6 bg-gray-50 focus:outline-none notion-doc"
              contentEditable
              suppressContentEditableWarning
              style={{ whiteSpace: 'pre-wrap', cursor: 'text' }}
              dangerouslySetInnerHTML={{ __html: getFullDocumentHtml() }}
            />
            <div className="mt-2 text-xs text-gray-500">Highlight text to see AI options (coming soon).</div>
            {/* Add a button to open the clarification panel */}
            <div className="fixed top-1/2 right-0 z-40 transform -translate-y-1/2">
              <button
                className="bg-blue-700 text-white px-3 py-2 rounded-l-lg shadow-lg hover:bg-blue-800 focus:outline-none"
                onClick={() => setClarificationPanelOpen(true)}
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                Clarifications
              </button>
            </div>
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

      {/* Clarification Panel */}
      {clarificationPanelOpen && (
        <div
          ref={clarificationPanelRef}
          className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-yellow-50 border-l border-yellow-200 shadow-xl flex flex-col"
          style={{ transition: 'transform 0.3s', transform: clarificationPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-yellow-200 bg-yellow-100">
            <h2 className="text-xl font-semibold text-[#442e1c]">AI needs more information</h2>
            <button
              className="text-gray-600 hover:text-gray-900 text-2xl font-bold px-2"
              onClick={() => setClarificationPanelOpen(false)}
              aria-label="Close clarification panel"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {clarificationMessage && (
              <div className="mb-4 text-blue-700 font-medium">{clarificationMessage}</div>
            )}
            {clarificationQuestions && clarificationQuestions.length > 0 ? (
              <form onSubmit={handleClarificationSubmit}>
                {clarificationQuestions.map((q, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-medium text-[#442e1c]">{q}</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...clarificationQuestions];
                          const newAnswers = [...clarificationAnswers];
                          newQuestions.splice(i, 1);
                          newAnswers.splice(i, 1);
                          setClarificationQuestions(newQuestions);
                          setClarificationAnswers(newAnswers);
                          if (newQuestions.length === 0) {
                            setShowClarificationModal(false);
                            setClarificationPanelOpen(false);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors duration-200"
                      >
                        Skip question
                      </button>
                    </div>
                    <textarea
                      className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                      rows={2}
                      value={clarificationAnswers[i]}
                      onChange={e => setClarificationAnswers(ans => ans.map((a, idx) => idx === i ? e.target.value : a))}
                      required
                      disabled={clarificationSubmitting}
                    />
                  </div>
                ))}
                <div className="text-right">
                  <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800" disabled={clarificationSubmitting}>
                    {clarificationSubmitting ? 'Submitting...' : 'Submit Clarifications'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClarificationQuestions(null);
                      setClarificationAnswers([]);
                      setShowClarificationModal(false);
                      setClarificationPanelOpen(false);
                    }}
                    className="ml-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-green-700 font-medium text-lg">All required information has been provided. The AI is updating your draft.</div>
            )}
          </div>
        </div>
      )}

      {/* Centered Clarification Modal (blocking) */}
      {showClarificationModal && clarificationQuestions && clarificationQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-xl p-6 w-[600px] max-w-full overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleClarificationSubmit}>
              <div className="modal-header flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#442e1c]">AI needs more information</h2>
              </div>
              {clarificationMessage && (
                <div className="mb-4 text-blue-700 font-medium">{clarificationMessage}</div>
              )}
              {clarificationQuestions.map((q, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-[#442e1c]">{q}</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestions = [...clarificationQuestions];
                        const newAnswers = [...clarificationAnswers];
                        newQuestions.splice(i, 1);
                        newAnswers.splice(i, 1);
                        setClarificationQuestions(newQuestions);
                        setClarificationAnswers(newAnswers);
                        if (newQuestions.length === 0) {
                          setShowClarificationModal(false);
                          setClarificationPanelOpen(false);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors duration-200"
                    >
                      Skip question
                    </button>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                    rows={2}
                    value={clarificationAnswers[i]}
                    onChange={e => setClarificationAnswers(ans => ans.map((a, idx) => idx === i ? e.target.value : a))}
                    required
                    disabled={clarificationSubmitting}
                  />
                </div>
              ))}
              <div className="text-right">
                <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800" disabled={clarificationSubmitting}>
                  {clarificationSubmitting ? 'Submitting...' : 'Submit Clarifications'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClarificationQuestions(null);
                    setClarificationAnswers([]);
                    setShowClarificationModal(false);
                    setClarificationPanelOpen(false);
                  }}
                  className="ml-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace; 