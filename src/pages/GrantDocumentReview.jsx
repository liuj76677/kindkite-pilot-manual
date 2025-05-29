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
  const [clarificationQuestions, setClarificationQuestions] = useState(null);
  const [clarificationAnswers, setClarificationAnswers] = useState([]);

  // Assemble the source content for hashing/caching
  const assembleSourceContent = () => {
    if (!grant || !grant.sections) return '';
    return grant.sections.map((section) => {
      const answer = answers[section.id] || '';
      return `${section.label}\n${answer}`;
    }).join('\n\n');
  };

  // Fetch or generate the polished document (now supports clarifications)
  const fetchOrPolishDocument = async (forceRepolish = false, clarifications = null) => {
    setLoading(true);
    setError('');
    setClarificationQuestions(null);
    const sourceContent = assembleSourceContent();
    try {
      if (!org.orgId || !grant._id) {
        setError('Missing organization or grant information.');
        setLoading(false);
        return;
      }
      // Try to fetch cached polished document
      if (!forceRepolish && !clarifications) {
        const res = await fetch(`/api/polished-document?orgId=${encodeURIComponent(org.orgId)}&grantId=${encodeURIComponent(grant._id)}&sourceContent=${encodeURIComponent(sourceContent)}`);
        if (res.ok) {
          const data = await res.json();
          setDocumentHtml(data.polishedDocument);
          setLoading(false);
          return;
        }
      }
      // If not found or forceRepolish, generate a new one (or handle clarifications)
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
          clarifications: clarifications || null
        })
      });
      if (!polishRes.ok) throw new Error('Failed to polish document with AI.');
      const polishData = await polishRes.json();
      if (polishData.clarificationQuestions) {
        setClarificationQuestions(polishData.clarificationQuestions);
        setClarificationAnswers(Array(polishData.clarificationQuestions.length).fill(''));
        setIsPolishing(false);
        setLoading(false);
        return;
      }
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
      setClarificationQuestions(null);
      setClarificationAnswers([]);
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

  // Handler for submitting clarification answers
  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    // Send clarifications as array of { question, answer }
    const clarifications = clarificationQuestions.map((q, i) => ({ question: q, answer: clarificationAnswers[i] }));
    await fetchOrPolishDocument(true, clarifications);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="bg-white shadow-xl rounded-xl p-10 max-w-3xl w-full prose prose-lg">
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
        ) : clarificationQuestions ? (
          <form onSubmit={handleClarificationSubmit} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#442e1c]">AI needs more information</h2>
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
        ) : (
          <div
            ref={editorRef}
            className="min-h-[400px] focus:outline-none"
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
    </div>
  );
} 