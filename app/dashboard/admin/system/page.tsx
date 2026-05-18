'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useSystem } from '@/contexts/SystemContext';
import { Server, Database, Wifi, Shield, AlertTriangle, Activity, Cpu, HardDrive, RefreshCw, Terminal, Bell, Settings, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  'Server Uptime': Cpu,
  'Database Performance': Database,
  'Network Latency': Wifi,
  'Security Status': Shield,
};

const METRIC_COLORS: Record<string, string> = {
  'Server Uptime': 'text-blue-500',
  'Database Performance': 'text-purple-500',
  'Network Latency': 'text-orange-500',
  'Security Status': 'text-green-500',
};

const METRIC_BG: Record<string, string> = {
  'Server Uptime': 'bg-blue-50',
  'Database Performance': 'bg-purple-50',
  'Network Latency': 'bg-orange-50',
  'Security Status': 'bg-green-50',
};

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function isISOString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

export default function AdminSystemPage() {
  const { metrics, alerts, services, isLoading, error, refreshSystemData } = useSystem();

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="System Health" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Infrastructure Monitoring</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Global Node Status</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">System Health Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshSystemData}
                className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group"
                title="Synchronize Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-2xl border border-green-100">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-green-600 uppercase tracking-widest text-[11px]">All Systems Operational</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
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
                  Infrastructure Health
                </span>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
               <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                       <AlertTriangle className="text-red-600" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-red-900 uppercase tracking-wider">Communication Fault</h3>
                       <p className="text-sm text-red-700 font-medium italic mt-0.5">{error}</p>
                    </div>
                  </div>
                  <button onClick={refreshSystemData} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all">Re-establish Uplink</button>
               </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-white border border-slate-100 rounded-[24px] animate-pulse" />
                  ))
                : metrics.map((metric, index) => {
                    const Icon = ICON_MAP[metric.name] ?? Server;
                    return (
                      <div key={index} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                         <div className={`w-12 h-12 ${METRIC_BG[metric.name] || 'bg-slate-50'} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                            <Icon className={`w-5 h-5 ${METRIC_COLORS[metric.name] || 'text-slate-400'}`} />
                         </div>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{metric.name}</p>
                         <p className="text-3xl font-bold text-slate-900 mt-2">{metric.value}</p>
                      </div>
                    );
                  })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Node Inventory / Service Status */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-playfair font-bold text-slate-900">Infrastructure Nodes</h3>
                       <p className="text-slate-400 text-sm font-light italic mt-0.5">Real-time service orchestration status</p>
                    </div>
                    <Settings className="w-5 h-5 text-slate-300" />
                 </div>
                 <div className="p-8 space-y-5 flex-1">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                           <span className="text-[14px] font-playfair font-bold text-slate-800 group-hover:text-primary transition-colors">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${service.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {service.status}
                           </span>
                           <ArrowRight size={14} className="text-slate-200 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Telemetry Alerts */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-playfair font-bold text-slate-900">System Telemetry</h3>
                       <p className="text-slate-400 text-sm font-light italic mt-0.5">Critical event & anomaly log</p>
                    </div>
                    <Bell className="w-5 h-5 text-slate-300" />
                 </div>
                 <div className="p-8 space-y-4 flex-1">
                    {alerts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <Shield size={48} className="text-slate-200 mb-4" />
                         <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Alerts Detected</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            alert.type === 'error' ? 'bg-red-100 text-red-600' : 
                            alert.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                             {alert.type === 'error' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                               <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{alert.severity} Level</p>
                               <span className="text-[10px] font-bold text-slate-400">{isISOString(alert.time) ? formatRelativeTime(alert.time) : alert.time}</span>
                            </div>
                            <p className="text-[13px] text-slate-500 font-light leading-snug line-clamp-2 italic">{alert.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            </div>

            {/* Administrative Protocols */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-10 relative overflow-hidden shadow-[0_30px_50px_rgba(0,0,0,0.15)]">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -mr-48 -mt-48" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <Terminal size={24} className="text-primary" />
                     <h3 className="text-2xl font-playfair font-black text-white">System Protocols</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Diagnostics', desc: 'Full node integrity scan', icon: Activity },
                      { title: 'Maintenance', desc: 'Schedule blackout windows', icon: HardDrive },
                      { title: 'Log Archive', desc: 'Access encrypted event logs', icon: Terminal },
                    ].map((action, i) => (
                      <button key={i} className="p-8 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 hover:border-primary/30 transition-all text-left group">
                         <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                            <action.icon className="text-slate-400 group-hover:text-primary transition-colors" size={28} />
                         </div>
                         <h4 className="text-xl font-playfair font-bold text-white mb-2">{action.title}</h4>
                         <p className="text-slate-500 text-sm font-medium italic mb-6">{action.desc}</p>
                         <div className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            Execute Protocol <ArrowRight size={14} />
                         </div>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Global Infrastructure Protocol</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
