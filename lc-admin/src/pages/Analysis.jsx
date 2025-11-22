import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, FileWarning, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function Analysis() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 1, name: 'Emergency Room Visit', date: '03/14/2023', cost: '$1,272.50', status: 'error', reason: 'Overcharged' },
    { id: 2, name: 'Medical Console', date: '03/14/2023', cost: '$102.00', status: 'ok' },
    { id: 3, name: 'Medical Console', date: '04/14/2023', cost: '$158.50', status: 'ok' },
    { id: 4, name: 'Emergency Room Visit', date: '03/14/2023', cost: '$124.50', status: 'ok' },
    { id: 5, name: 'Medical Console', date: '02/24/2023', cost: '$69.50', status: 'ok' },
    { id: 6, name: 'Emergency Room Visit', date: '02/24/2023', cost: '$65.00', status: 'ok' },
    { id: 7, name: 'Medical Console', date: '02/24/2023', cost: '$152.50', status: 'ok' },
    { id: 8, name: 'Medical Console', date: '02/24/2023', cost: '$75.00', status: 'ok' },
  ];

  const handleDisputeLetter = () => {
    alert('Generating professional dispute letter... This will be sent to your healthcare provider.');
  };

  return (
    <div className="min-h-screen p-8 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis</h1>
        <p className="text-slate-500 font-sans">Detailed breakdown of service charges</p>
      </div>

      {/* Alert Banner */}
      <div className="mb-8 bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-700" />
        </div>
        <p className="text-slate-900 font-serif text-lg">
          3 potential discrepancies detected. Total savings potential: <span className="font-bold">$1,272.50</span>
        </p>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Services Table */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Billed Services
            </h3>
          </div>
          
          <div className="p-0">
            <table className="w-full">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Cost</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${
                      service.status === 'error' 
                        ? 'bg-amber-50 hover:bg-amber-100' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-4 text-sm text-slate-600">{service.date}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900" style={{ fontFamily: 'Merriweather, serif' }}>
                          {service.name}
                        </span>
                        {service.status === 'error' && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded border border-amber-200">
                            Overcharged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-slate-900">
                      {service.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Dr. Lucid Console */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dr. Lucid Analysis
                </h3>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {!selectedService ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Select a service from the table to see AI analysis</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-slate-900 leading-relaxed" style={{ fontFamily: 'Merriweather, serif' }}>
                    Dr. Lucid Console is considre: standards for ormilliqueating AI medical bill prccessing and eaee status, conservwal information abour noeruthis and incorrruation. Fur ways to know understamment have cotrrlcttions with mottore cheuisility, and your help, cut trought.
                  </p>
                </div>

                {selectedService.status === 'error' && (
                  <Button
                    onClick={handleDisputeLetter}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg shadow-sm"
                  >
                    Auto-Draft Dispute Letter
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}