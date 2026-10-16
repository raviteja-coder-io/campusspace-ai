/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Clock, 
  Users, 
  ShieldCheck, 
  Activity, 
  Calendar,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Room, ClassSchedule, EventRecord, RoomRequest } from '../types/dataset';
import { computeCampusAnalytics } from '../services/analyticsEngine';
import { searchAndRankRooms } from '../services/roomMatcher';
import { RoomCard } from './RoomCard';

interface OverviewProps {
  rooms: Room[];
  schedules: ClassSchedule[];
  events: EventRecord[];
  requests: RoomRequest[];
  onNavigateToFinder: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToAbout: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  rooms,
  schedules,
  events,
  requests,
  onNavigateToFinder,
  onNavigateToAnalytics,
  onNavigateToAbout,
}) => {
  const analytics = useMemo(() => {
    return computeCampusAnalytics(rooms, schedules, events, requests);
  }, [rooms, schedules, events, requests]);

  // Default quick preview search
  const quickPreviewResults = useMemo(() => {
    return searchAndRankRooms(
      rooms,
      {
        date: '2025-09-15',
        startHour: 14,
        durationHours: 2,
        requiredCapacity: 30,
        preferredRoomType: 'All',
        preferredBuilding: 'All',
        projectorRequired: true,
        computersRequired: false,
        accessibleRequired: false,
        minPowerOutlets: 0,
      },
      schedules,
      events
    );
  }, [rooms, schedules, events]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200/80">
            <span>DATATHON TRACK 2 // EDUCATION</span>
            <span aria-hidden="true">·</span>
            <span>DATA-DRIVEN MVP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            The Campus Has Space. <span className="text-teal-600">Students Don’t.</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            CampusSpace AI answers the central datathon question: <em>"Given a room request, what is the best feasible room and what evidence supports that recommendation?"</em>
            <br />
            Powered directly by 120 room profiles, 5,000 course schedules, and 1,800 events records.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToFinder}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-teal-400" />
              <span>Find Best Feasible Room</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onNavigateToAnalytics}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Campus Space Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Ground Truth Dataset Statistics (Loaded from CSV)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Official Datathon Records</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Campus Rooms</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {analytics.totalRooms}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">120 profiles in rooms.csv</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Class Schedules</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {analytics.totalScheduledClasses.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recurring weekly blocks</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Recorded Events</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {analytics.totalEventsRecorded.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Events with attendance</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Historical Requests</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {analytics.totalRoomRequests.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pre-allocation demand</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Avg Room Size</div>
            <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
              {analytics.avgCapacity}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Seats per room</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-medium">Operating Load</div>
            <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
              {analytics.overallScheduledUtilizationPct}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg utilization rate</div>
          </div>
        </div>
      </div>

      {/* How CampusSpace AI Works (The 4-Stage Feasibility Engine) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">
            How CampusSpace AI Evaluates Every Room Request
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict rule-based feasibility checks precede any scoring. A high score can never override a known conflict.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold font-mono text-xs">
              01
            </div>
            <div className="font-bold text-slate-900 text-sm">Capacity Feasibility</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Verifies <code className="text-slate-800 font-mono">room.capacity &ge; requested_capacity</code>. Rejects undersized spaces immediately.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold font-mono text-xs">
              02
            </div>
            <div className="font-bold text-slate-900 text-sm">Facility Requirements</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Validates mandatory projector, computer workstations, power outlets, and wheelchair ADA accessibility.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold font-mono text-xs">
              03
            </div>
            <div className="font-bold text-slate-900 text-sm">Interval Conflict Checks</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tests for overlaps with 5,000 class schedules and 1,800 events using rigorous interval overlap logic: <code className="text-slate-800 font-mono">reqStart &lt; existEnd &amp;&amp; existStart &lt; reqEnd</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold font-mono text-xs">
              04
            </div>
            <div className="font-bold text-slate-900 text-sm">Explainable Fit Scoring</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Ranks feasible rooms by capacity efficiency (penalizing wasted empty seats), facility suitability, and location convenience.
            </p>
          </div>
        </div>
      </div>

      {/* Live Sample Recommendations Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Recommendation Demonstration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sample evaluation: Monday, Sept 15, 14:00–16:00 (30 students, Projector required)
            </p>
          </div>

          <button
            onClick={onNavigateToFinder}
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Interactive Finder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPreviewResults.feasibleRooms.slice(0, 2).map((rec, i) => (
            <RoomCard
              key={rec.room.room_id}
              recommendation={rec}
              requestedCapacity={30}
              rank={i + 1}
            />
          ))}
        </div>
      </div>

      {/* Mini Campus Footprint Visual */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Campus Building Space Inventory
            </h3>
            <p className="text-xs text-slate-500">Distribution of the 120 rooms across campus zones</p>
          </div>
          <Building2 className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {analytics.roomsByBuilding.map((b) => (
            <div key={b.building} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-800">{b.building} Building</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {b.count} <span className="text-xs text-slate-400 font-normal">rooms</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {b.totalCapacity} total seats
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
