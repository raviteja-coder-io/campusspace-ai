/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  Layers, 
  TrendingUp, 
  HelpCircle, 
  BarChart3, 
  PieChart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Room, ClassSchedule, EventRecord, RoomRequest } from '../types/dataset';
import { computeCampusAnalytics } from '../services/analyticsEngine';

interface AnalyticsDashboardProps {
  rooms: Room[];
  schedules: ClassSchedule[];
  events: EventRecord[];
  requests: RoomRequest[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  rooms,
  schedules,
  events,
  requests,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const analytics = useMemo(() => {
    return computeCampusAnalytics(rooms, schedules, events, requests);
  }, [rooms, schedules, events, requests]);

  // Max calculations for clean SVG charts
  const maxWeekdayCount = Math.max(...analytics.schedulesByWeekday.map((d) => d.count), 1);
  const maxHourCount = Math.max(...analytics.schedulesByHour.map((h) => h.count), 1);
  const maxBuildingCount = Math.max(...analytics.roomsByBuilding.map((b) => b.count), 1);
  const maxTypeCount = Math.max(...analytics.roomsByType.map((t) => t.count), 1);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Space Utilization Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Empirical analytics derived from 120 room profiles, 5,000 course schedules, and 1,800 event records.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Total Campus Rooms</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analytics.totalRooms}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 5 Buildings
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Total Student Seats</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analytics.totalCapacity.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg {analytics.avgCapacity} seats / room
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Scheduled Classes</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analytics.totalScheduledClasses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Weekly recurrent blocks
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Campus Events</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analytics.totalEventsRecorded.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Recorded guest/club/exams
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Weekly Scheduled Load</div>
          <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
            {analytics.avgWeeklyScheduledHoursPerRoom}h
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg per room / week
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Campus Utilization</div>
          <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
            {analytics.overallScheduledUtilizationPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Of 60h standard week
          </div>
        </div>
      </div>

      {/* Utilization Methodology Notice */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Utilization Formula & Denominator Definition: </span>
          <span>
            Scheduled Utilization = (Weekly Scheduled Class Hours) / (60 Operating Hours/Week). Operating window is defined as Monday–Saturday, 08:00–18:00. This tracks formal academic allocations, distinct from transient physical occupancy.
          </span>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Schedules by Weekday */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Scheduled Classes by Weekday
              </h3>
              <p className="text-xs text-slate-500">Distribution of 5,000 classes across the week</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {analytics.schedulesByWeekday.map((d) => {
              const pct = Math.round((d.count / maxWeekdayCount) * 100);
              return (
                <div key={d.weekday} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{d.weekday}</span>
                    <span className="text-slate-500 font-mono">
                      {d.count} classes ({d.totalHours} hrs)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Schedules by Hour (Peak Campus Load) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class Starting Times (Hourly Profile)
              </h3>
              <p className="text-xs text-slate-500">Peak academic hours across 08:00 to 17:00</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="pt-2">
            <div className="h-44 flex items-end gap-2 border-b border-slate-200 pb-2">
              {analytics.schedulesByHour.map((h) => {
                const heightPct = Math.round((h.count / maxHourCount) * 100);
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap z-10">
                      {h.count} classes
                    </div>
                    <div
                      className="w-full bg-slate-800 hover:bg-teal-600 transition-colors rounded-t-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>08:00 (Morning)</span>
              <span>13:00 (Midday)</span>
              <span>17:00 (Evening)</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Room Distribution by Type */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Room Inventory by Facility Type
              </h3>
              <p className="text-xs text-slate-500">Total rooms and cumulative capacity</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {analytics.roomsByType.map((t) => {
              const pct = Math.round((t.count / maxTypeCount) * 100);
              return (
                <div key={t.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{t.type}</span>
                    <span className="text-slate-500 font-mono">
                      {t.count} rooms · {t.totalCapacity} total seats
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 transition-all duration-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Building Distribution & Amenities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Building Footprint & Facilities
              </h3>
              <p className="text-xs text-slate-500">Distribution across campus zones</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {analytics.roomsByBuilding.map((b) => {
              const pct = Math.round((b.count / maxBuildingCount) * 100);
              return (
                <div key={b.building} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{b.building} Building</span>
                    <span className="text-slate-500 font-mono">
                      {b.count} rooms ({b.totalCapacity} seats)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick amenity breakdown */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">Projectors</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">
                {analytics.projectorPercentage}%
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">Computer Labs</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">
                {analytics.computersPercentage}%
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">ADA Accessible</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">
                {analytics.accessiblePercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Attendance Analysis: Expected vs. Actual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Campus Events: Expected vs. Actual Attendance
            </h3>
            <p className="text-xs text-slate-500">
              Attendance realization across 1,800 recorded campus events in events.csv
            </p>
          </div>
          <Activity className="w-4 h-4 text-teal-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 font-semibold">Event Type</th>
                <th className="py-2.5 font-semibold text-right">Total Events</th>
                <th className="py-2.5 font-semibold text-right">Avg Expected</th>
                <th className="py-2.5 font-semibold text-right">Avg Actual</th>
                <th className="py-2.5 font-semibold text-right">Realization Rate</th>
                <th className="py-2.5 font-semibold pl-4">Capacity Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.eventsByType.map((evt) => {
                const avgExp = Math.round(evt.expected / evt.count);
                const avgAct = Math.round(evt.actual / evt.count);
                const isUnder = evt.realizationRate < 100;
                return (
                  <tr key={evt.type} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-semibold text-slate-900">{evt.type}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">{evt.count}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">{avgExp}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">{avgAct}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-bold">
                      <span className={isUnder ? 'text-amber-600' : 'text-teal-600'}>
                        {evt.realizationRate}%
                      </span>
                    </td>
                    <td className="py-2.5 pl-4">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isUnder ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${Math.min(100, evt.realizationRate)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utilization Rankings: Top 10 Heavily Scheduled vs. Top 10 Least Scheduled */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Heavily Scheduled */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-teal-700 text-xs font-semibold">
                <ArrowUpRight className="w-4 h-4 text-teal-600" />
                <span>HIGH OPERATING PRESSURE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Top 10 Most Heavily Scheduled Rooms
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2 font-medium">Room</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Capacity</th>
                  <th className="py-2 font-medium text-right">Weekly Sched</th>
                  <th className="py-2 font-medium text-right">Load %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topUtilizedRooms.map((r) => (
                  <tr key={r.room_id} className="hover:bg-slate-50/50">
                    <td className="py-2 font-mono font-bold text-slate-900">{r.room_id}</td>
                    <td className="py-2 text-slate-600">{r.room_type} ({r.building})</td>
                    <td className="py-2 font-mono tabular-nums text-slate-600">{r.capacity}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-slate-900 font-semibold">{r.weeklyHours}h/wk</td>
                    <td className="py-2 text-right font-mono tabular-nums font-bold text-teal-700">{r.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Least Scheduled Rooms (Underused Space Opportunity) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
                <ArrowDownRight className="w-4 h-4 text-amber-600" />
                <span>UNCLAIMED CAPACITY</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Top 10 Underused / Low-Scheduled Rooms
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2 font-medium">Room</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Capacity</th>
                  <th className="py-2 font-medium text-right">Weekly Sched</th>
                  <th className="py-2 font-medium text-right">Load %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.leastUtilizedRooms.map((r) => (
                  <tr key={r.room_id} className="hover:bg-slate-50/50">
                    <td className="py-2 font-mono font-bold text-slate-900">{r.room_id}</td>
                    <td className="py-2 text-slate-600">{r.room_type} ({r.building})</td>
                    <td className="py-2 font-mono tabular-nums text-slate-600">{r.capacity}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-slate-900 font-semibold">{r.weeklyHours}h/wk</td>
                    <td className="py-2 text-right font-mono tabular-nums font-bold text-amber-700">{r.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
