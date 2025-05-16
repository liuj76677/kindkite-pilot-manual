import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GrantDocumentReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const org = location.state?.org || {};
  const grant = location.state?.grant || {};
  const answers = location.state?.answers || {};
  const [documentHtml, setDocumentHtml] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    // Assemble the document from grant questions and answers
    if (!grant || !grant.sections) return;
    const html = grant.sections.map((section, idx) => {
      const answer = answers[section.id] || '';
      return `<h2 style='margin-top:2em;'>${section.label}</h2><div style='margin-bottom:2em;'>${answer.replace(/\n/g, '<br/>')}</div>`;
    }).join('');
    setDocumentHtml(html);
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
      <div
        ref={editorRef}
        className="prose prose-lg min-h-[400px] border rounded p-6 bg-gray-50 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        style={{ whiteSpace: 'pre-wrap', cursor: 'text' }}
        onMouseUp={handleAIAction}
        dangerouslySetInnerHTML={{ __html: documentHtml }}
      />
      <div className="mt-4 text-right">
        <button className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Export as PDF</button>
      </div>
      <div className="mt-2 text-xs text-gray-500">Highlight text to see AI options (coming soon).</div>
    </div>
  );
} 