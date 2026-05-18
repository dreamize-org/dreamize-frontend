'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Shield, Globe, Clock, Wallet, Save, RotateCcw, ShieldCheck, Database, Zap, Lock, Monitor, AlertTriangle, type LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';
import { PremiumInput } from '@/components/ui/premium-input';

export default function AdminSettingsPage() {
    const [systemSettings, setSystemSettings] = useState({
        platformName: 'Dreamize',
        defaultCurrency: 'RWF',
        timezone: 'Africa/Kigali',
        sessionTimeout: 30,
        requireMFA: true,
        autoBackup: true,
        maintenanceMode: false
    });

    const handleSaveSettings = () => {
        console.log('Saving system settings:', systemSettings);
    };

    const Toggle = ({
        enabled,
        onChange,
        label,
        desc,
        icon: Icon,
    }: {
        enabled: boolean;
        onChange: (next: boolean) => void;
        label: string;
        desc: string;
        icon: LucideIcon;
    }) => (
      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100 group hover:border-primary/20 transition-all">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>
              <Icon size={20} />
           </div>
           <div>
              <div className="text-[14px] font-playfair font-bold text-slate-900 uppercase tracking-tight">{label}</div>
              <div className="text-xs text-slate-500 font-light italic mt-0.5">{desc}</div>
           </div>
        </div>
        <button
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary shadow-[0_0_15px_rgba(255,184,0,0.4)]' : 'bg-slate-200'}`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
          />
        </button>
      </div>
    );

    return (
        <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
            <Sidebar activeItem="Settings" userType={UserRole.ADMIN} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Global Configuration</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[12px] font-medium text-slate-400 italic">Core Parameters</span>
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900">Platform Environment</h1>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
                      >
                        <Save className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-10">
                        
                        {/* Section Header with Badge */}
                        <div className="mb-10">
                          <div className="relative inline-flex items-center justify-center mb-6">
                            <div className="absolute -top-[14px] -left-[14px] w-9 h-9 pointer-events-none text-primary">
                              <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                                <line x1="8" y1="8" x2="14" y2="14" />
                                <line x1="2" y1="20" x2="10" y2="20" />
                                <line x1="20" y1="2" x2="20" y2="10" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full shadow-sm border border-primary/10">
                              Global Configuration
                            </span>
                          </div>
                        </div>

                        {/* Platform Branding Section */}
                        <section>
                           <h2 className="text-xl font-playfair font-bold text-slate-900 mb-6 flex items-center gap-3">
                              <Monitor className="text-primary" size={24} />
                              Branding & Localization
                           </h2>
                           <div className="bg-white rounded-[24px] border border-slate-100 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <PremiumInput
                                   label="Platform Name"
                                   icon={<Globe size={20} />}
                                   value={systemSettings.platformName}
                                   onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                                 />
                                 <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Financial Base Currency</label>
                                    <div className="relative group">
                                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                                      <select
                                        value={systemSettings.defaultCurrency}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, defaultCurrency: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none"
                                      >
                                          <option value="RWF">RWF - Rwandan Franc</option>
                                          <option value="USD">USD - US Dollar</option>
                                          <option value="EUR">EUR - Euro</option>
                                      </select>
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Temporal Timezone</label>
                                    <div className="relative group">
                                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                                      <select
                                        value={systemSettings.timezone}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none"
                                      >
                                          <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                                          <option value="UTC">UTC</option>
                                          <option value="America/New_York">America/New_York (EST)</option>
                                      </select>
                                    </div>
                                 </div>
                                 <PremiumInput
                                   label="Global Session Limit (Minutes)"
                                   icon={<Lock size={20} />}
                                   type="number"
                                   value={systemSettings.sessionTimeout.toString()}
                                   onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })}
                                 />
                              </div>
                           </div>
                        </section>

                        {/* Security Protocols Section */}
                        <section>
                           <h2 className="text-xl font-playfair font-bold text-slate-900 mb-6 flex items-center gap-3">
                              <ShieldCheck className="text-primary" size={24} />
                              Security Protocols
                           </h2>
                           <div className="bg-white rounded-[24px] border border-slate-100 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] space-y-4">
                                <Toggle 
                                  enabled={systemSettings.requireMFA}
                                  onChange={(val: boolean) => setSystemSettings({ ...systemSettings, requireMFA: val })}
                                  label="Mandatory Multi-Factor"
                                  desc="Enforce cryptographic verification for all admin level access."
                                  icon={Shield}
                                />
                                <Toggle 
                                  enabled={systemSettings.autoBackup}
                                  onChange={(val: boolean) => setSystemSettings({ ...systemSettings, autoBackup: val })}
                                  label="Automatic Cloud Backup"
                                  desc="Daily snapshot of entire core database to secure storage."
                                  icon={Database}
                                />
                                <Toggle 
                                  enabled={systemSettings.maintenanceMode}
                                  onChange={(val: boolean) => setSystemSettings({ ...systemSettings, maintenanceMode: val })}
                                  label="System Isolation Mode"
                                  desc="Restrict public access to platform during emergency maintenance."
                                  icon={Zap}
                                />
                           </div>
                        </section>

                        {/* Dangerous Actions */}
                        <section className="bg-red-50/50 rounded-[24px] p-10 border border-red-100">
                           <div className="flex items-center gap-3 mb-6">
                              <AlertTriangle className="text-red-500" size={24} />
                              <h2 className="text-xl font-playfair font-bold text-red-900">Danger Zone</h2>
                           </div>
                           <div className="flex flex-col md:flex-row gap-4">
                              <button className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group">
                                 <RotateCcw size={18} className="group-hover:rotate-[-90deg] transition-transform" />
                                 Reset Configuration to Factory Defaults
                              </button>
                              <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                                 Flush All Server Caches
                              </button>
                           </div>
                        </section>

                        <div className="py-10 text-center">
                           <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Environment Protocol v4.0</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

