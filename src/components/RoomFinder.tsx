/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  Layers, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Room, ClassSchedule, EventRecord, RoomSearchQuery, RoomRecommendation } from '../types/dataset';
import { searchAndRankRooms, getWeekdayFromDate } from '../services/roomMatcher';
import { RoomCard } from './RoomCard';
import { RoomDetailsModal } from './RoomDetailsModal';

interface RoomFinderProps {
  rooms: Room[];
  schedules: ClassSchedule[];
  events: EventRecord[];
}

export const RoomFinder: React.FC<RoomFinderProps> = ({ rooms, schedules, events }) => {
  // Search Form State
  const [date, setDate] = useState('2025-09-15');
  const [startHour, setStartHour] = useState<number>(14);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [requiredCapacity, setRequiredCapacity] = useState<number>(35);
  const [preferredRoomType, setPreferredRoomType] = useState<string>('All');
  const [preferredBuilding, setPreferredBuilding] = useState<string>('All');
  const [projectorRequired, setProjectorRequired] = useState<boolean>(true);
  const [computersRequired, setComputersRequired] = useState<boolean>(false);
  const [accessibleRequired, setAccessibleRequired] = useState<boolean>(false);
  const [minPowerOutlets, setMinPowerOutlets] = useState<number>(0);

  // Filter / view state
  const [activeResultTab, setActiveResultTab] = useState<'feasible' | 'excluded'>('feasible');
  const [exclusionFilter, setExclusionFilter] = useState<string>('all');
  const [selectedRoomForModal, setSelectedRoomForModal] = useState<RoomRecommendation | null>(null);

  const query: RoomSearchQuery = useMemo(() => ({
    date,
    startHour,
    durationHours,
    requiredCapacity,
    preferredRoomType,
    preferredBuilding,
    projectorRequired,
    computersRequired,
    accessibleRequired,
    minPowerOutlets,
  }), [
    date,
    startHour,
    durationHours,
    requiredCapacity,
    preferredRoomType,
    preferredBuilding,
    projectorRequired,
    computersRequired,
    accessibleRequired,
    minPowerOutlets,
  ]);

  // Execute ranking on current query and datasets
  const searchResults = useMemo(() => {
    return searchAndRankRooms(rooms, query, schedules, events);
  }, [rooms, query, schedules, events]);

  const { feasibleRooms, excludedRooms, bestRecommendation, totalEvaluated } = searchResults;

  const weekday = getWeekdayFromDate(date);

  // Presets for quick demonstration
  const applyPreset = (presetName: string) => {
    if (presetName === 'study') {
      setRequiredCapacity(8);
      setDurationHours(2);
      setPreferredRoomType('Study room');
      setProjectorRequired(false);
      setComputersRequired(false);
      setAccessibleRequired(false);
      setMinPowerOutlets(6);
    } else if (presetName === 'coding_lab') {
      setRequiredCapacity(35);
      setDurationHours(2);
      setPreferredRoomType('Lab');
      setProjectorRequired(true);
      setComputersRequired(true);
      setAccessibleRequired(false);
      setMinPowerOutlets(10);
    } else if (presetName === 'seminar') {
      setRequiredCapacity(60);
      setDurationHours(3);
      setPreferredRoomType('Seminar');
      setProjectorRequired(true);
      setComputersRequired(false);
      setAccessibleRequired(true);
      setMinPowerOutlets(0);
    } else if (presetName === 'large_class') {
      setRequiredCapacity(110);
      setDurationHours(2);
      setPreferredRoomType('Classroom');
      setProjectorRequired(true);
      setComputersRequired(false);
      setAccessibleRequired(true);
      setMinPowerOutlets(0);
    }
  };

  const handleReset = () => {
    setDate('2025-09-15');
    setStartHour(14);
    setDurationHours(2);
    setRequiredCapacity(35);
    setPreferredRoomType('All');
    setPreferredBuilding('All');
    setProjectorRequired(true);
    setComputersRequired(false);
    setAccessibleRequired(false);
    setMinPowerOutlets(0);
  };

  // Filter excluded rooms by category
  const filteredExcluded = useMemo(() => {
    if (exclusionFilter === 'all') return excludedRooms;
    return excludedRooms.filter((r) => 
      r.exclusionReasons.some((re) => re.category === exclusionFilter)
    );
  }, [excludedRooms, exclusionFilter]);

  return (
    <div className="space-y-8">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Smart Room Finder
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Feasibility-checked, conflict-free recommendations with transparent evidence scoring.
        </p>
      </div>

      {/* Preset Test Scenarios for Judges */}
      <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Quick Hackathon Test Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => applyPreset('study')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Study Pod (8 seats)
          </button>
          <button
            onClick={() => applyPreset('coding_lab')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Lab (35 seats + Computers)
          </button>
          <button
            onClick={() => applyPreset('seminar')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Seminar (60 seats + ADA)
          </button>
          <button
            onClick={() => applyPreset('large_class')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Lecture (110 seats)
          </button>
        </div>
      </div>

      {/* Main Search Panel & Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Requested Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Day: <strong className="text-slate-700">{weekday}</strong>
            </span>
          </div>

          {/* 2. Start Time & Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Start Time & Duration</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {Array.from({ length: 13 }, (_, i) => 8 + i).map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>

              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={5}>5 hours</option>
              </select>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              Window: {startHour}:00 – {startHour + durationHours}:00
            </span>
          </div>

          {/* 3. Seating Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Required Capacity (Seats)</span>
            </label>
            <input
              type="number"
              min={1}
              max={250}
              value={requiredCapacity}
              onChange={(e) => setRequiredCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[15, 30, 50, 90, 140].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setRequiredCapacity(cap)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    requiredCapacity === cap 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Room Type Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Preferred Room Type</span>
            </label>
            <select
              value={preferredRoomType}
              onChange={(e) => setPreferredRoomType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="All">All Types</option>
              <option value="Classroom">Classroom</option>
              <option value="Lab">Computer/Science Lab</option>
              <option value="Seminar">Seminar Room</option>
              <option value="Study room">Study Room / Pod</option>
              <option value="Auditorium">Auditorium / Hall</option>
            </select>

            <div className="mt-1.5">
              <select
                value={preferredBuilding}
                onChange={(e) => setPreferredBuilding(e.target.value)}
                className="w-full px-3 py-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              >
                <option value="All">Any Building</option>
                <option value="Central">Central Building</option>
                <option value="North">North Building</option>
                <option value="South">South Building</option>
                <option value="East">East Building</option>
                <option value="West">West Building</option>
              </select>
            </div>
          </div>
        </div>

        {/* Facility Checkboxes & Power Outlets */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={projectorRequired}
              onChange={(e) => setProjectorRequired(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="font-medium">Projector Required</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={computersRequired}
              onChange={(e) => setComputersRequired(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="font-medium">Computer Lab Workstations</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accessibleRequired}
              onChange={(e) => setAccessibleRequired(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="font-medium">Wheelchair Accessible (ADA)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 whitespace-nowrap">Min Outlets:</span>
            <input
              type="number"
              min={0}
              max={30}
              value={minPowerOutlets}
              onChange={(e) => setMinPowerOutlets(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded text-center focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search Parameters</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Evaluating {totalEvaluated} campus rooms
            </span>
            <div className="px-4 py-2 bg-slate-900 text-teal-400 font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs">
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>{feasibleRooms.length} Feasible Rooms Found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Limitation Notice */}
      <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Estimated Availability Assessment: </span>
          <span>
            Results are calculated using conflict-detection algorithms against synthetic course schedules and campus events. A room with zero recorded conflicts is an estimated candidate, not real-time live sensor availability.
          </span>
        </div>
      </div>

      {/* Top Best Recommendation Spotlight */}
      {bestRecommendation && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-700/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                TOP ALGORITHMIC MATCH
              </div>
              <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
                Room {bestRecommendation.room.room_id}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {bestRecommendation.room.building} Building · Floor {bestRecommendation.room.floor} · {bestRecommendation.room.room_type} · {bestRecommendation.room.capacity} seats capacity
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold font-mono text-teal-400">
                {bestRecommendation.recommendationScore}
                <span className="text-sm text-slate-400 font-normal"> / 100</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Capacity Fit: <strong className="text-teal-300">{bestRecommendation.capacityFitPercentage}%</strong> ({bestRecommendation.capacityWasteSeats} buffer seats)
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10 text-xs text-slate-200 space-y-1.5">
            <div className="font-semibold text-teal-200 mb-1">Why this room ranks #1:</div>
            {bestRecommendation.evidenceReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-teal-400">✔</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section Tabs */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveResultTab('feasible')}
              className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeResultTab === 'feasible'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Feasible Rooms ({feasibleRooms.length})</span>
            </button>

            <button
              onClick={() => setActiveResultTab('excluded')}
              className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ml-4 ${
                activeResultTab === 'excluded'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Excluded Rooms ({excludedRooms.length})</span>
            </button>
          </div>

          {activeResultTab === 'excluded' && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-slate-500">Filter reason:</span>
              <select
                value={exclusionFilter}
                onChange={(e) => setExclusionFilter(e.target.value)}
                className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700"
              >
                <option value="all">All Failures</option>
                <option value="capacity">Capacity Deficit</option>
                <option value="schedule_conflict">Class Overlap</option>
                <option value="event_conflict">Event Overlap</option>
                <option value="facility">Missing Facilities</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Feasible Rooms */}
        {activeResultTab === 'feasible' && (
          <div>
            {feasibleRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feasibleRooms.map((rec, index) => (
                  <RoomCard
                    key={rec.room.room_id}
                    recommendation={rec}
                    requestedCapacity={requiredCapacity}
                    rank={index + 1}
                    onSelectForDetails={(r) => setSelectedRoomForModal(r)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    No Rooms Fully Feasible with These Exact Constraints
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Every room failed at least one mandatory invariant (capacity, facility, or schedule conflict).
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl max-w-lg mx-auto text-left text-xs text-slate-700 border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-2">Suggested Relaxation Actions:</div>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                    <li>Try adjusting start hour to <strong>16:00</strong> or <strong>09:00</strong> where class block density is lower.</li>
                    <li>Uncheck "Computer Lab Workstations" if laptops can be brought by attendees.</li>
                    <li>Inspect the "Excluded Rooms" tab to view exactly which classes or capacity limits blocked each room.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Excluded Rooms */}
        {activeResultTab === 'excluded' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>
                Showing {filteredExcluded.length} of {excludedRooms.length} rooms that failed mandatory constraints:
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExcluded.map((rec) => (
                <RoomCard
                  key={rec.room.room_id}
                  recommendation={rec}
                  requestedCapacity={requiredCapacity}
                  onSelectForDetails={(r) => setSelectedRoomForModal(r)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timetable Inspection Modal */}
      {selectedRoomForModal && (
        <RoomDetailsModal
          recommendation={selectedRoomForModal}
          onClose={() => setSelectedRoomForModal(null)}
          schedules={schedules}
          events={events}
          selectedDate={date}
        />
      )}
    </div>
  );
};
