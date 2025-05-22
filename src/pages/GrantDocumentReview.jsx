import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GrantDocumentReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const org = location.state?.org || {};
  const grant = location.state?.grant || {};
  const answers = location.state?.answers || {};
  const [documentHtml, setDocumentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const editorRef = useRef(null);

  // Assemble the source content for hashing/caching
  const assembleSourceContent = () => {
    if (!grant || !grant.sections) return '';
    return grant.sections.map((section) => {
      const answer = answers[section.id] || '';
      return `${section.label}\n${answer}`;
    }).join('\n\n');
  };

  // Fetch or generate the polished document
  const fetchOrPolishDocument = async (forceRepolish = false) => {
    setLoading(true);
    setError('');
    const sourceContent = assembleSourceContent();
    try {
      if (!org.orgId || !grant._id) {
        setError('Missing organization or grant information.');
        setLoading(false);
        return;
      }
      // Try to fetch cached polished document
      if (!forceRepolish) {
        const res = await fetch(`/api/polished-document?orgId=${encodeURIComponent(org.orgId)}&grantId=${encodeURIComponent(grant._id)}&sourceContent=${encodeURIComponent(sourceContent)}`);
        if (res.ok) {
          const data = await res.json();
          setDocumentHtml(data.polishedDocument);
          setLoading(false);
          return;
        }
      }
      // If not found or forceRepolish, generate a new one
      setIsPolishing(true);
      const polishRes = await fetch('/api/polish-full-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: grant.requirements || [],
          instructions: grant.instructions || '',
          guidelines: grant.guidelines || {},
          evaluation: grant.evaluation || [],
          answers: grant.sections.map(section => ({
            label: section.label,
            answer: answers[section.id] || ''
          })),
          grantTitle: grant.name || grant.title,
          orgName: org.organization,
          prompt: 'Polish and format this grant application as a single, cohesive, ready-to-submit document. Return only HTML.'
        })
      });
      if (!polishRes.ok) throw new Error('Failed to polish document with AI.');
      const polishData = await polishRes.json();
      setDocumentHtml(polishData.polishedDocument);
      // Save the polished document to cache
      await fetch('/api/polished-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: org.orgId,
          grantId: grant._id,
          sourceContent,
          polishedDocument: polishData.polishedDocument
        })
      });
      setIsPolishing(false);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred.');
      setIsPolishing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrPolishDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grant, answers]);

  // AI action placeholder
  const handleAIAction = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (selectedText) {
      // Placeholder: Replace with actual AI call
      alert(`AI would process: ${selectedText}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow">
      <button
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        onClick={() => navigate(-1)}
      >
        ← Back to Grant Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-2 text-[#442e1c]">{grant.name || grant.title} - Comprehensive Document</h1>
      <p className="text-lg text-[#5e4633] italic mb-4">{org.organization}</p>
      <div className="mb-8 text-sm text-[#5e4633]">{grant.funder} | Deadline: {grant.deadline}</div>
      <div className="mb-4 text-right">
        <button
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
          onClick={() => fetchOrPolishDocument(true)}
          disabled={isPolishing || loading}
        >
          {isPolishing ? 'Polishing...' : 'Re-Polish Full Document with AI'}
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading document...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : (
        <div
          ref={editorRef}
          className="prose prose-lg min-h-[400px] border rounded p-6 bg-gray-50 focus:outline-none"
          contentEditable
          suppressContentEditableWarning
          style={{ whiteSpace: 'pre-wrap', cursor: 'text' }}
          onMouseUp={handleAIAction}
          dangerouslySetInnerHTML={{ __html: documentHtml }}
        />
      )}
      <div className="mt-4 text-right">
        <button className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Export as PDF</button>
      </div>
      <div className="mt-2 text-xs text-gray-500">Highlight text to see AI options (coming soon).</div>
    </div>
  );
} 