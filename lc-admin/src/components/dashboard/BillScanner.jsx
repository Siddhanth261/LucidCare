import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BillScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsScanning(true);
    setExtractedData(null);

    // Simulate scanning
    setTimeout(() => {
      setExtractedData({
        total: '$5,247.83',
        provider: 'Mercy Hospital',
        date: 'Jan 15, 2025',
        serviceType: 'Emergency Care',
        insuranceCovered: '$3,800.00',
        patientResponsibility: '$1,447.83',
        status: 'Review Required'
      });
      setIsScanning(false);
    }, 2500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">
          Bill Scanner
        </h3>
      </div>
      <div className="p-5">

        {!extractedData && !isScanning && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${
              isDragging
                ? 'border-slate-400 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
            </div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              Upload Bill
            </p>
            <p className="text-xs text-slate-500">
              Drag PDF or click to browse
            </p>
          </div>
        )}

        {isScanning && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
            <p className="text-base font-medium text-slate-900 mb-3">
              Scanning your bill...
            </p>
            <div className="max-w-xs mx-auto">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-700 rounded-full animate-pulse transition-all duration-300" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        )}

        {extractedData && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-600 mb-1">Analysis complete</p>
              <p className="text-lg font-semibold text-slate-900">Ready for review</p>
            </div>

            <button
              onClick={() => setExtractedData(null)}
              className="w-full py-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-all"
            >
              Scan Another Bill
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}