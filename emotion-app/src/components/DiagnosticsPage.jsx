import React from 'react';
import { FileText, UploadCloud, Sparkles, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function DiagnosticsPage({ file, onFileUpload, summary, isAnalyzing }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Medical Diagnostics</h1>
              <p className="text-gray-600 mt-1">AI-powered medical report analysis and insights</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-xl font-semibold text-gray-800">Upload Medical Report</h2>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg transition-all">
              <UploadCloud size={22} />
              <span className="font-medium text-base">Choose PDF File</span>
              <input type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
            </label>
            {file && (
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-100 px-5 py-4 rounded-lg border border-gray-200">
                <div className="p-1.5 bg-gray-700 rounded-lg">
                  <FileCheck size={18} className="text-white" />
                </div>
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 min-h-[600px]">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-5">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-700"></div>
                <div className="text-center">
                  <div className="text-gray-700 font-semibold text-lg mb-1">Analyzing Document</div>
                  <div className="text-gray-600 text-sm">Processing medical report with AI...</div>
                </div>
              </div>
            ) : summary ? (
              <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-p:my-4 prose-p:leading-relaxed prose-ul:my-4 prose-li:text-gray-700 prose-li:my-2 prose-strong:text-gray-900 prose-strong:font-medium prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md">
                <ReactMarkdown>
                  {summary}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-5 text-center">
                <div className="p-6 bg-gray-100 rounded-lg">
                  <FileText size={56} className="text-gray-600" />
                </div>
                <div className="text-gray-500 max-w-md">
                  <p className="font-semibold text-gray-800 text-lg mb-2">Ready for Analysis</p>
                  <p className="text-sm leading-relaxed">Upload a medical report PDF to receive comprehensive AI-powered diagnostics, detailed analysis, and personalized insights.</p>
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
