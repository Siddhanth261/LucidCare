import React from 'react';
import { Home, FileText, X, Menu } from 'lucide-react';

function Drawer({ isOpen, onClose, onNavigate, currentPage }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fadeIn"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white/98 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-300 ease-out border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Menu size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">LucidCare</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-5 space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-lg transition-all ${
              currentPage === 'dashboard'
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-700 hover:bg-gray-100 font-medium'
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('diagnostics')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-lg transition-all ${
              currentPage === 'diagnostics'
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-700 hover:bg-gray-100 font-medium'
            }`}
          >
            <FileText size={20} />
            <span>Run Diagnostics</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <div className="mb-1">v1.0.0</div>
            <div className="text-gray-400">LucidCare Healthcare System</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Drawer;
