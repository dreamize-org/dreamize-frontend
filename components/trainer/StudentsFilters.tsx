'use client';

import { Search, Filter, X } from 'lucide-react';

interface StudentsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export default function StudentsFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange
}: StudentsFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Mentees' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Verification' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors z-10" />
          <input
            type="text"
            placeholder="Search mentees by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 lg:w-[320px]">
          {/* Status Filter */}
          <div className="relative flex-1 group">
            <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors z-10" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none cursor-pointer text-slate-700"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedStatus !== 'all' || searchQuery) && (
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Filters:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold rounded-lg uppercase tracking-wider">
              Search: "{searchQuery}"
              <button 
                onClick={() => onSearchChange('')}
                className="hover:text-slate-900 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-lg uppercase tracking-wider">
              Status: {statusOptions.find(opt => opt.value === selectedStatus)?.label}
              <button 
                onClick={() => onStatusChange('all')}
                className="hover:text-slate-900 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          <button 
            onClick={() => {
              onSearchChange('');
              onStatusChange('all');
            }}
            className="text-[11px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors ml-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}