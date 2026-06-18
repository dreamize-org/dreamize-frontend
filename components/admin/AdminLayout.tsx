'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';

const ADMIN_BG = 'bg-[#FDF9F2]';

export function AdminShell({
  activeItem,
  children,
}: {
  activeItem: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-h-screen lg:h-screen ${ADMIN_BG}`}>
      <Sidebar activeItem={activeItem} userType={UserRole.ADMIN} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function AdminHeader({
  badge,
  subtitle,
  title,
  actions,
}: {
  badge: string;
  subtitle?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {badge}
            </span>
            {subtitle ? (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">{subtitle}</span>
              </>
            ) : null}
          </div>
          <h1 className="text-2xl font-playfair font-bold text-slate-900">{title}</h1>
        </div>
        {actions ? <div className="flex items-center gap-3 flex-wrap">{actions}</div> : null}
      </div>
    </header>
  );
}

export function AdminMain({
  children,
  maxWidth = 'max-w-7xl',
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className={`${maxWidth} mx-auto`}>{children}</div>
    </main>
  );
}

export function AdminSectionBadge({ label }: { label: string }) {
  return (
    <div className="mb-10">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute -top-[14px] -left-[14px] w-9 h-9 pointer-events-none text-primary">
          <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
            <line x1="8" y1="8" x2="14" y2="14" />
            <line x1="2" y1="20" x2="10" y2="20" />
            <line x1="20" y1="2" x2="20" y2="10" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full shadow-sm border border-primary/10">
          {label}
        </span>
      </div>
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-primary',
  iconBgClassName = 'bg-primary/10',
  className = '',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group ${className}`}
    >
      <div
        className={`w-12 h-12 ${iconBgClassName} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}
      >
        <Icon className={`w-5 h-5 ${iconClassName}`} />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

export function AdminHeroCard({
  eyebrow,
  title,
  description,
  footer,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  footer?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 md:p-10 relative overflow-hidden group shadow-[0_30px_50px_rgba(0,0,0,0.15)]">
      <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">{eyebrow}</p>
          <div className="text-4xl md:text-5xl font-playfair font-light text-white mb-3">{title}</div>
          <p className="text-slate-400 font-light max-w-md leading-relaxed text-sm">{description}</p>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
        {actions ? <div className="lg:col-span-5 flex flex-col gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  headerRight,
  className = '',
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden ${className}`}
    >
      {(title || headerRight) && (
        <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {title ? (
            <div>
              <h2 className="text-xl font-playfair font-bold text-slate-900">{title}</h2>
              {description ? (
                <p className="text-slate-500 text-sm font-light italic mt-0.5">{description}</p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="p-16 sm:p-20 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
        <Icon size={40} className="text-slate-200" />
      </div>
      <h3 className="text-xl font-playfair font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 font-light max-w-md mx-auto">{description}</p>
    </div>
  );
}

export function AdminLoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="p-20 text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400 font-medium">{label}</p>
    </div>
  );
}

export function AdminFooter({ label }: { label: string }) {
  return (
    <div className="mt-12 text-center">
      <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">{label}</p>
    </div>
  );
}
