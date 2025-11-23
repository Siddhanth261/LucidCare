import React from 'react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function MedicalSummary({ summary, isAnalyzing }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-grow flex flex-col h-64">
      <h2 className="text-lg font-semibold mb-2 text-slate-800 flex items-center gap-2">
        <FileText size={16} /> Run Diagnostics
      </h2>
      <div className="bg-slate-50 p-4 rounded-lg flex-grow overflow-y-auto text-sm leading-relaxed text-slate-700 border border-gray-100">
        {isAnalyzing ? (
          <div className="animate-pulse text-indigo-500">Analyzing document structure...</div>
        ) : summary ? (
          <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-headings:font-semibold prose-p:text-slate-700 prose-p:my-2 prose-ul:my-2 prose-li:text-slate-700 prose-strong:text-slate-800 prose-strong:font-semibold">
            <ReactMarkdown>
              {summary}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-slate-500">Upload a report to generate a summary.</div>
        )}
      </div>
    </div>
  );
}

export default MedicalSummary;
