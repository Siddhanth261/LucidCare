import React from 'react';
import { Menu } from 'lucide-react';

function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-30 p-3.5 bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md"
      aria-label="Open menu"
    >
      <Menu size={24} className="text-gray-700" />
    </button>
  );
}

export default MenuButton;
