import React from 'react';
import { Card } from '@/components/ui/card';

export default function History() {
  const bills = [
    { id: 1, provider: 'Mercy Hospital', date: '04/14/2023', total: '$1,272.50', status: 'Under Review', statusColor: 'amber' },
    { id: 2, provider: 'Mercy Hospital', date: '03/14/2023', total: '$1,272.50', status: 'Resolved', statusColor: 'teal' },
    { id: 3, provider: 'Medical Hospital', date: '03/14/2023', total: '$102.50', status: 'Resolved', statusColor: 'teal' },
    { id: 4, provider: 'Medical Hospital', date: '02/24/2023', total: '$169.50', status: 'Paid', statusColor: 'blue' },
    { id: 5, provider: 'Medical Hospital', date: '02/24/2023', total: '$102.50', status: 'Paid', statusColor: 'blue' },
    { id: 6, provider: 'Medical Hospital', date: '02/24/2023', total: '$1,272.50', status: 'Resolved', statusColor: 'teal' },
    { id: 7, provider: 'Mercy Hospital', date: '02/24/2023', total: '$153.00', status: 'Disputed', statusColor: 'rose' },
    { id: 8, provider: 'Mercy Hospital', date: '02/24/2023', total: '$123.50', status: 'Disputed', statusColor: 'rose' },
  ];

  const getStatusStyles = (color) => {
    const styles = {
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      rose: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return styles[color] || styles.amber;
  };

  return (
    <div className="min-h-screen p-8 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">History</h1>
        <p className="text-slate-500 font-sans">Archive of all analyzed documents</p>
      </div>

      {/* Bills Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <Card key={bill.id} className="bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {bill.provider}
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusStyles(bill.statusColor)}`}>
                  {bill.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-sm text-slate-500">{bill.date}</p>
                <p className="text-xl font-serif font-bold text-slate-900">{bill.total}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}