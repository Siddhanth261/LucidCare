import React from 'react';
import BillAnalyzer from './BillAnalyzer';
import { Receipt, Shield, TrendingUp } from 'lucide-react';

function BillAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <BillAnalyzer />
      </div>
    </div>
  );
}

export default BillAnalysisPage;