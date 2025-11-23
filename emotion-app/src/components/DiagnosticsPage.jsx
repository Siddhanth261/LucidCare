import React from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function DiagnosticsPage({ file, onFileUpload, summary, isAnalyzing }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <FileText size={32} className="text-indigo-600" />
            Run Diagnostics
          </h1>
          <p className="text-slate-600">Upload and analyze medical reports with AI-powered insights</p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Medical Report Upload</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
              <UploadCloud size={20} />
              <span className="font-medium">Select PDF Report</span>
              <input type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
            </label>
            {file && (
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200">
                <FileText size={16} className="text-indigo-600" />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics Results Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Analysis Results</h2>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-gray-200 min-h-[500px]">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div className="text-indigo-600 font-medium">Analyzing document structure...</div>
              </div>
            ) : summary ? (
              <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-700 prose-p:my-3 prose-ul:my-3 prose-li:text-slate-700 prose-strong:text-slate-800 prose-strong:font-semibold prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>
                  {summary}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileText size={48} className="text-gray-400" />
                </div>
                <div className="text-slate-500 max-w-md">
                  <p className="font-medium text-slate-700 mb-2">No report uploaded yet</p>
                  <p className="text-sm">Upload a medical report to generate comprehensive diagnostics and AI-powered analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticsPage;
