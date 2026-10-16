/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Clock, Calendar, Building2, Tv, Monitor, Accessibility, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RoomRecommendation, ClassSchedule, EventRecord } from '../types/dataset';
import { getWeekdayFromDate } from '../services/roomMatcher';

interface RoomDetailsModalProps {
  recommendation: RoomRecommendation | null;
  onClose: () => void;
  schedules: ClassSchedule[];
  events: EventRecord[];
  selectedDate: string;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  recommendation,
  onClose,
  schedules,
  events,
  selectedDate,
}) => {
  if (!recommendation) return null;

  const { room, isFeasible, recommendationScore } = recommendation;
  const weekday = getWeekdayFromDate(selectedDate);

  // Get all schedules for this room on this weekday
  const roomSchedules = schedules
    .filter((s) => s.room_id === room.room_id && s.weekday.toLowerCase() === weekday.toLowerCase())
    .sort((a, b) => a.start_hour - b.start_hour);

  // Get all events for this room on this date
  const roomEvents = events
    .filter((e) => {
      if (e.room_id !== room.room_id) return false;
      const d = e.start_time.split(' ')[0] || e.start_time.split('T')[0];
      return d === selectedDate;
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Time grid from 08:00 to 20:00 (12 hours)
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-lg font-mono">
              {room.room_id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-mono">
                  Room {room.room_id} Timetable & Profile
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isFeasible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {isFeasible ? 'Feasible' : 'Conflicts / Invariant Fail'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {room.building} Building · Floor {room.floor} · {room.room_type} · {room.capacity} seats max capacity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Room Specs Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Room Facilities & Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Tv className="w-4 h-4 text-teal-600" />
                  <span>Projector</span>
                </div>
                <div className="font-semibold text-slate-800">
                  {room.projector ? 'Installed' : 'None'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Monitor className="w-4 h-4 text-teal-600" />
                  <span>Computers</span>
                </div>
                <div className="font-semibold text-slate-800">
                  {room.computers ? 'Equipped Lab' : 'Standard Desks'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Accessibility className="w-4 h-4 text-teal-600" />
                  <span>Accessibility</span>
                </div>
                <div className="font-semibold text-slate-800">
                  {room.accessible ? 'ADA Accessible' : 'Step Access Only'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Power Outlets</span>
                </div>
                <div className="font-semibold text-slate-800 font-mono tabular-nums">
                  {room.power_outlets} ports
                </div>
              </div>
            </div>
          </div>

          {/* Daily Schedule Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Recorded Occupancy: {selectedDate} ({weekday})</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {roomSchedules.length} class{roomSchedules.length === 1 ? '' : 'es'} · {roomEvents.length} event{roomEvents.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Time Blocks List */}
            {roomSchedules.length === 0 && roomEvents.length === 0 ? (
              <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold">Entire Day is Open in Synthetic Datasets</p>
                <p className="text-emerald-700/80 mt-0.5">
                  No scheduled academic courses or campus events are registered for Room {room.room_id} on {weekday}s.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {roomSchedules.map((s, idx) => (
                  <div 
                    key={`sched-${idx}`}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="px-2 py-1 bg-slate-900 text-white rounded font-mono text-xs font-bold shrink-0">
                        {s.start_hour}:00 - {s.start_hour + s.duration_hours}:00
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          Course {s.course_code} · {s.department} Department
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Weekly scheduled class · Duration: {s.duration_hours} hour{s.duration_hours === 1 ? '' : 's'} · Expected attendance: {s.expected_attendance} students
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {roomEvents.map((e, idx) => {
                  const time = e.start_time.split(' ')[1] || '00:00:00';
                  return (
                    <div 
                      key={`evt-${idx}`}
                      className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start justify-between text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-2 py-1 bg-amber-600 text-white rounded font-mono text-xs font-bold shrink-0">
                          {time.slice(0, 5)} (+{e.duration_hours}h)
                        </div>
                        <div>
                          <div className="font-semibold text-amber-900">
                            {e.event_type} (Special Campus Event)
                          </div>
                          <div className="text-amber-700 text-[11px] mt-0.5">
                            Expected: {e.expected_attendance} · Actual: {e.actual_attendance} attendees
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Recommendation Score: {recommendationScore}/100
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
};
