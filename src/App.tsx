/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  BarChart3, 
  HelpCircle, 
  Database, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { Room, ClassSchedule, EventRecord, RoomRequest, DatasetStatus } from './types/dataset';
import { loadDatasets, getCachedData } from './services/dataLoader';
import { computeCampusAnalytics } from './services/analyticsEngine';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { RoomFinder } from './components/RoomFinder';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { HistoricalDemand } from './components/HistoricalDemand';
import { UnderutilizedSpace } from './components/UnderutilizedSpace';
import { AboutSection } from './components/AboutSection';
import { DatasetManagerModal } from './components/DatasetManagerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'finder' | 'analytics' | 'about'>('overview');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'utilization' | 'demand' | 'underused'>('utilization');
  
  // Datasets State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [requests, setRequests] = useState<RoomRequest[]>([]);
  const [datasetStatus, setDatasetStatus] = useState<DatasetStatus>({
    roomsCount: 0,
    schedulesCount: 0,
    eventsCount: 0,
    requestsCount: 0,
    loadedAt: new Date(),
    source: 'official',
    errors: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Initial Data Load
  const fetchData = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await loadDatasets(force);
      setRooms(data.rooms);
      setSchedules(data.schedules);
      setEvents(data.events);
      setRequests(data.requests);
      setDatasetStatus(data.status);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDataUpdated = () => {
    const cached = getCachedData();
    setRooms([...cached.rooms]);
    setSchedules([...cached.schedules]);
    setEvents([...cached.events]);
    setRequests([...cached.requests]);
    setDatasetStatus({ ...cached.status });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetStatus={datasetStatus}
        onOpenDatasetManager={() => setIsDatasetModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-900">Loading Campus Datasets...</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Parsing 120 rooms, 5,000 class schedules, 1,800 events, and 5,000 room requests.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Notice if files failed */}
        {!isLoading && datasetStatus.errors.length > 0 && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Dataset Warning: </span>
                <span>{datasetStatus.errors.join('; ')}</span>
              </div>
            </div>
            <button
              onClick={() => setIsDatasetModalOpen(true)}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold cursor-pointer shrink-0"
            >
              Resolve in Dataset Manager
            </button>
          </div>
        )}

        {/* Loaded Viewport by Tab */}
        {!isLoading && (
          <div>
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <Overview
                rooms={rooms}
                schedules={schedules}
                events={events}
                requests={requests}
                onNavigateToFinder={() => setActiveTab('finder')}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
                onNavigateToAbout={() => setActiveTab('about')}
              />
            )}

            {/* Tab 2: Find a Room */}
            {activeTab === 'finder' && (
              <RoomFinder
                rooms={rooms}
                schedules={schedules}
                events={events}
              />
            )}

            {/* Tab 3: Campus Analytics with Sub-Navigation */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Analytics Sub-Header Selector */}
                <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl max-w-md">
                  <button
                    onClick={() => setAnalyticsSubTab('utilization')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      analyticsSubTab === 'utilization'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Campus Utilization
                  </button>
                  <button
                    onClick={() => setAnalyticsSubTab('demand')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      analyticsSubTab === 'demand'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Historical Demand
                  </button>
                  <button
                    onClick={() => setAnalyticsSubTab('underused')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      analyticsSubTab === 'underused'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Underused Space
                  </button>
                </div>

                {analyticsSubTab === 'utilization' && (
                  <AnalyticsDashboard
                    rooms={rooms}
                    schedules={schedules}
                    events={events}
                    requests={requests}
                  />
                )}

                {analyticsSubTab === 'demand' && (
                  <HistoricalDemand requests={requests} />
                )}

                {analyticsSubTab === 'underused' && (
                  <UnderutilizedSpace 
                    analytics={computeCampusAnalytics(rooms, schedules, events, requests)} 
                  />
                )}
              </div>
            )}

            {/* Tab 4: About */}
            {activeTab === 'about' && <AboutSection />}
          </div>
        )}
      </main>

      {/* Dataset Manager Modal */}
      <DatasetManagerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        datasetStatus={datasetStatus}
        rooms={rooms}
        schedules={schedules}
        events={events}
        requests={requests}
        onDataUpdated={handleDataUpdated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CampusSpace AI</span>
            <span>·</span>
            <span>DATATHON Track 2: Education</span>
            <span>·</span>
            <span className="text-slate-400">“The Campus Has Space. Students Don’t.”</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Synthetic Educational Dataset (11,920 records)</span>
            <span>·</span>
            <span>Zero Unexplained AI Scores</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
