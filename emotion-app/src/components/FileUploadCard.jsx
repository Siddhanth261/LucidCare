import React from 'react';
import { FileText, UploadCloud } from 'lucide-react';

function FileUploadCard({ file, onFileUpload }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-800">
        <FileText size={18} /> Medical Report Upload
      </h2>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition">
          <UploadCloud size={16} />
          <span className="text-sm">Select PDF</span>
          <input type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
        </label>
        {file && (
          <div className="text-sm text-slate-700 bg-slate-50 px-3 py-1 rounded border border-gray-100">
            {file.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploadCard;
