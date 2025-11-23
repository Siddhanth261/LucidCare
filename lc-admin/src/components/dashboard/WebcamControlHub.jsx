import React from 'react';
import { Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function WebcamControlHub({ isActive, onToggle }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`w-12 h-7 rounded-full transition-all ${
              isActive ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              isActive ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
            Camera {isActive ? 'On' : 'Off'}
          </span>
        </div>
        
        <Select defaultValue="facetime">
          <SelectTrigger className="h-8 text-sm border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="facetime">FaceTime HD Camera</SelectItem>
            <SelectItem value="external">External Camera</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-1 text-xs text-slate-600">
          <Lock className="w-3 h-3" />
          <span>Local Processing Only</span>
        </div>
      </div>
    </div>
  );
}