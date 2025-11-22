
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileSearch, History, Settings } from 'lucide-react';
import { createPageUrl } from "../lib/utils";


export default function Layout({ children, currentPageName }) {
  const navigation = [
    { name: 'Home', path: 'Home', icon: Home },
    { name: 'Analysis', path: 'Analysis', icon: FileSearch },
    { name: 'History', path: 'History', icon: History },
    { name: 'Settings', path: 'Settings', icon: Settings },
  ];

  const isActive = (pageName) => currentPageName === pageName;

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-[#F9F9F9] border-r border-slate-200 flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-white font-serif">L</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Merriweather, serif' }}>LucidCare</h1>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'}`} />
                <span className="hidden lg:block font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 bg-[#F9F9F9]">
        {children}
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: #F9F9F9;
          color: #1e293b;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Merriweather', serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
