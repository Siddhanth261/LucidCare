import React from 'react';
import BillAnalyzer from './BillAnalyzer';
import { Receipt, Shield, TrendingUp } from 'lucide-react';

function BillAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Medical Bill Analyzer
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <BillAnalyzer />
      </div>
    </div>
  );
}

export default BillAnalysisPage;