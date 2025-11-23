import React from 'react';
import { Camera, CheckCircle } from 'lucide-react';

function Header({ initializing }) {
  return (
    <header className="mb-6 flex justify-between items-center border-b border-gray-200 pb-4">
      <h1 className="text-2xl font-semibold text-indigo-600 flex items-center gap-3">
        <Camera size={24} className="text-indigo-600" />
        Lucid Care
      </h1>
      <div className="text-gray-600 text-sm flex items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded"> 
          <CheckCircle size={12} /> {initializing ? 'Loading Models...' : 'System Active'}
        </span>
      </div>
    </header>
  );
}

export default Header;
