/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, Building2 } from 'lucide-react';
import { DatasetStatus } from '../types/dataset';

interface HeaderProps {
  activeTab: 'overview' | 'finder' | 'analytics' | 'about';
  setActiveTab: (tab: 'overview' | 'finder' | 'analytics' | 'about') => void;
  datasetStatus: DatasetStatus;
  onOpenDatasetManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  datasetStatus,
  onOpenDatasetManager,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-lg shadow-xs">
            <Building2 className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              CampusSpace<span className="text-teal-600">AI</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono tracking-tight">
              DATATHON T2
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links, single line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('finder')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'finder'
                ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find a Room
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'analytics'
                ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Campus Analytics
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'about'
                ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Dataset Manager) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDatasetManager}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Inspect, upload, or export real CSV datasets"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Datasets:</span>
            <span className="font-mono tabular-nums text-slate-900 font-semibold">
              {datasetStatus.roomsCount} Rooms
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-around bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-1 px-2 whitespace-nowrap ${activeTab === 'overview' ? 'text-teal-600 font-bold' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('finder')}
          className={`py-1 px-2 whitespace-nowrap ${activeTab === 'finder' ? 'text-teal-600 font-bold' : ''}`}
        >
          Find Room
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1 px-2 whitespace-nowrap ${activeTab === 'analytics' ? 'text-teal-600 font-bold' : ''}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`py-1 px-2 whitespace-nowrap ${activeTab === 'about' ? 'text-teal-600 font-bold' : ''}`}
        >
          About
        </button>
      </div>
    </header>
  );
};
