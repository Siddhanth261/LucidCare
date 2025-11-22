import React, { useState } from 'react';
import { User, Activity, Volume2, Shield, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com'
  });

  const [biometric, setBiometric] = useState({
    allowBiometric: true,
    showBiometric: true
  });

  const [voice, setVoice] = useState({
    speed: 1.0,
    volume: 0.8,
    language: 'en-US'
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen p-8 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-sans">Configure your application preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Profile
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="bg-white border-slate-200 text-slate-900 focus:border-teal-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-slate-700">Last Name</Label>
              <Input
                id="lastname"
                placeholder="Last Name"
                className="bg-white border-slate-200 text-slate-900 focus:border-teal-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="bg-white border-slate-200 text-slate-900 focus:border-teal-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                className="bg-white border-slate-200 text-slate-900 focus:border-teal-700"
              />
            </div>
          </div>
        </Card>

        {/* Biometric Preferences */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Biometric Preferences
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <span className="text-slate-900 font-medium">Use Biometric Mirror</span>
              <button
                onClick={() => setBiometric({...biometric, allowBiometric: !biometric.allowBiometric})}
                className={`w-11 h-6 rounded-full transition-all ${
                  biometric.allowBiometric ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  biometric.allowBiometric ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <span className="text-slate-900 font-medium">Show Stress Indicators</span>
              <button
                onClick={() => setBiometric({...biometric, showBiometric: !biometric.showBiometric})}
                className={`w-11 h-6 rounded-full transition-all ${
                  biometric.showBiometric ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  biometric.showBiometric ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <span className="text-slate-900 font-medium">Local Processing Only</span>
              <button
                className="w-11 h-6 rounded-full transition-all bg-slate-900"
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-5.5 ml-0.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Voice Settings */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Voice Settings
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-slate-700">Speech Speed</Label>
                <span className="text-xs font-bold text-slate-900">1.0x</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={50}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            
            <div>
               <div className="flex justify-between mb-2">
                <Label className="text-slate-700">Volume</Label>
                <span className="text-xs font-bold text-slate-900">70%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={70}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-10">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Account Security */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Account Security
            </h3>
          </div>
          
          <div className="p-6 space-y-3">
            <button className="w-full p-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-teal-700 transition-all text-left flex items-center justify-between group">
              <span className="font-medium text-slate-900">Change Password</span>
              <span className="text-slate-400 group-hover:text-teal-700">→</span>
            </button>
            
            <button className="w-full p-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-teal-700 transition-all text-left flex items-center justify-between group">
              <span className="font-medium text-slate-900">Two-Factor Authentication</span>
              <span className="text-slate-400 group-hover:text-teal-700">→</span>
            </button>
            
            <button className="w-full p-4 bg-rose-50 rounded-lg border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all text-left">
              <span className="font-medium text-rose-700">Delete Account</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}