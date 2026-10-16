/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  Tv, 
  Monitor,
  Info
} from 'lucide-react';
import { RoomRequest } from '../types/dataset';

interface HistoricalDemandProps {
  requests: RoomRequest[];
}

export const HistoricalDemand: React.FC<HistoricalDemandProps> = ({ requests }) => {
  const stats = useMemo(() => {
    const total = requests.length;
    const statusCounts: Record<string, number> = {
      Approved: 0,
      Waitlisted: 0,
      Rejected: 0,
      Cancelled: 0,
    };
    const purposeCounts: Record<string, { count: number; totalCap: number }> = {};
    const hourCounts: Record<number, number> = {};
    for (let h = 8; h <= 20; h++) hourCounts[h] = 0;

    let projectorCount = 0;
    let computersCount = 0;
    let smallReq = 0; // <= 25
    let medReq = 0;   // 26 - 70
    let largeReq = 0; // > 70

    requests.forEach((r) => {
      // Status
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status] += 1;
      }

      // Purpose
      const p = r.purpose || 'General';
      if (!purposeCounts[p]) purposeCounts[p] = { count: 0, totalCap: 0 };
      purposeCounts[p].count += 1;
      purposeCounts[p].totalCap += r.required_capacity;

      // Hour
      if (hourCounts[r.start_hour] !== undefined) {
        hourCounts[r.start_hour] += 1;
      }

      // Facilities
      if (r.projector_required) projectorCount += 1;
      if (r.computers_required) computersCount += 1;

      // Capacity bucket
      if (r.required_capacity <= 25) smallReq += 1;
      else if (r.required_capacity <= 70) medReq += 1;
      else largeReq += 1;
    });

    const statusList = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    const purposeList = Object.entries(purposeCounts).map(([purpose, val]) => ({
      purpose,
      count: val.count,
      pct: total > 0 ? Math.round((val.count / total) * 100) : 0,
      avgCap: val.count > 0 ? Math.round(val.totalCap / val.count) : 0,
    })).sort((a, b) => b.count - a.count);

    const hourList = Object.entries(hourCounts).map(([h, count]) => ({
      hour: parseInt(h, 10),
      count,
    })).sort((a, b) => a.hour - b.hour);

    const maxHour = Math.max(...hourList.map((h) => h.count), 1);
    const unfulfilledRate = total > 0 ? Math.round(((statusCounts.Waitlisted + statusCounts.Rejected) / total) * 100) : 0;

    return {
      total,
      statusList,
      purposeList,
      hourList,
      maxHour,
      projectorPct: total > 0 ? Math.round((projectorCount / total) * 100) : 0,
      computersPct: total > 0 ? Math.round((computersCount / total) * 100) : 0,
      smallPct: total > 0 ? Math.round((smallReq / total) * 100) : 0,
      medPct: total > 0 ? Math.round((medReq / total) * 100) : 0,
      largePct: total > 0 ? Math.round((largeReq / total) * 100) : 0,
      unfulfilledRate,
    };
  }, [requests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Waitlisted': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Waitlisted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Historical Student & Campus Demand Analysis
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Analysis of 5,000 historical requests from room_requests.csv representing pre-allocation campus demand.
        </p>
      </div>

      {/* Methodology notice */}
      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Demand Integrity Note: </span>
          <span>
            These records document raw campus demand rather than confirmed bookings. As indicated in README.txt, room_requests.csv does not contain room IDs because requests were logged prior to room allocation.
          </span>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Historical Requests Logged</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 4-month academic window
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Unfulfilled Demand (Waitlist + Rejection)</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {stats.unfulfilledRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Core catalyst for DATATHON Track 2
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Projector Demand</div>
          <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
            {stats.projectorPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requests requiring AV presentation
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Computer Lab Demand</div>
          <div className="text-2xl font-bold font-mono text-teal-600 mt-1">
            {stats.computersPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requests requiring dedicated PCs
          </div>
        </div>
      </div>

      {/* Grid: Status Distribution vs Purpose Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Request Outcome Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Percentage and volume of historical resolution outcomes
          </p>

          <div className="space-y-3">
            {stats.statusList.map((s) => (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    {getStatusIcon(s.status)}
                    <span>{s.status}</span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-500">
                    {s.count.toLocaleString()} requests ({s.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      s.status === 'Approved' ? 'bg-emerald-500' :
                      s.status === 'Waitlisted' ? 'bg-amber-500' :
                      s.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Key Finding: </span>
            Nearly 40% of all submitted requests fail to secure immediate confirmation (Waitlisted or Rejected), reflecting high friction for student initiatives despite available physical campus capacity.
          </div>
        </div>

        {/* Requests by Purpose */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Demand Distribution by Booking Purpose
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Activities driving requests and their average seating requirements
          </p>

          <div className="space-y-3">
            {stats.purposeList.map((p) => (
              <div key={p.purpose} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p.purpose}</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {p.count.toLocaleString()} reqs ({p.pct}%) · Avg {p.avgCap} seats
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-800 rounded-full transition-all duration-300"
                    style={{ width: `${p.pct * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Scale Segmentation */}
          <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">Small (&le; 25 seats)</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{stats.smallPct}%</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">Medium (26-70)</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{stats.medPct}%</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400 text-[11px]">Large (&gt; 70)</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{stats.largePct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Demand Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Requested Booking Start Times (08:00 to 20:00)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Peak student demand concentrated in afternoon and early evening hours
        </p>

        <div className="h-36 flex items-end gap-2 border-b border-slate-200 pb-2">
          {stats.hourList.map((h) => {
            const heightPct = Math.round((h.count / stats.maxHour) * 100);
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap z-10">
                  {h.count} requests
                </div>
                <div
                  className="w-full bg-teal-600 hover:bg-teal-500 transition-colors rounded-t-sm"
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
          <span>08:00 (Early Morning)</span>
          <span>14:00 (Peak Afternoon)</span>
          <span>20:00 (Night Study)</span>
        </div>
      </div>
    </div>
  );
};
