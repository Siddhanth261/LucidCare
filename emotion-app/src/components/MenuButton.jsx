import React from 'react';
import { Menu } from 'lucide-react';

function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-30 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl border border-gray-200 transition-all hover:bg-gray-50"
      aria-label="Open menu"
    >
      <Menu size={24} className="text-slate-700" />
    </button>
  );
}

export default MenuButton;
