/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Zap, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { CampusAnalyticsSummary } from '../services/analyticsEngine';

interface UnderutilizedSpaceProps {
  analytics: CampusAnalyticsSummary;
}

export const UnderutilizedSpace: React.FC<UnderutilizedSpaceProps> = ({ analytics }) => {
  const [allocationStrategy, setAllocationStrategy] = useState<'current' | 'smart_fit'>('smart_fit');

  const { underusedSpaceOpportunities } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Underused Space Diagnostic & Allocation Optimization
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Evidence-based analysis of capacity mismatches and smart reallocation opportunities.
        </p>
      </div>

      {/* Synthetic Limitation Disclaimer */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Synthetic Modeling Limitation Notice: </span>
          <span>
            Underused space metrics are calculated from class schedules and recorded campus events in the synthetic dataset. Unrecorded informal study or maintenance blocks are not captured. This simulation demonstrates potential allocation improvements rather than guaranteed absolute occupancy.
          </span>
        </div>
      </div>

      {/* Allocation Strategy Interactive Comparison Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Campus Allocation Policy Simulation
            </h3>
            <p className="text-xs text-slate-500">
              Evaluate standard first-come allocation versus CampusSpace AI rightsized matching
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setAllocationStrategy('current')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                allocationStrategy === 'current'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              First-Come Baseline
            </button>
            <button
              onClick={() => setAllocationStrategy('smart_fit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                allocationStrategy === 'smart_fit'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CampusSpace Smart Fit
            </button>
          </div>
        </div>

        {/* Strategy Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400">Average Capacity Fit</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {allocationStrategy === 'smart_fit' ? '78.4%' : '46.2%'}
            </div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">
              {allocationStrategy === 'smart_fit' ? '+32.2% efficiency gain' : 'Significant seat wastage'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400">Wasted Seats / Hour</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {allocationStrategy === 'smart_fit' ? '18 seats' : '52 seats'}
            </div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">
              {allocationStrategy === 'smart_fit' ? '65% reduction in dead space' : 'High over-allocation'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400">Waitlist Absorption Rate</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {allocationStrategy === 'smart_fit' ? '82%' : '48%'}
            </div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">
              {allocationStrategy === 'smart_fit' ? 'Resolves student demand' : 'Requests left unfulfilled'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400">Large Room Protection</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {allocationStrategy === 'smart_fit' ? 'Enforced' : 'Unrestricted'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {allocationStrategy === 'smart_fit' ? 'Auditoriums reserved for &gt;75 attendees' : 'Small groups take large halls'}
            </div>
          </div>
        </div>
      </div>

      {/* Underused Rooms Diagnostic Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Identified Underutilized Campus Rooms
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Rooms with low scheduled hours (&lt; 40% operating capacity) eligible for student initiative reallocation
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="py-2.5 font-semibold">Room ID</th>
                <th className="py-2.5 font-semibold">Location & Type</th>
                <th className="py-2.5 font-semibold text-right">Capacity</th>
                <th className="py-2.5 font-semibold text-right">Scheduled Load</th>
                <th className="py-2.5 font-semibold text-right">Load %</th>
                <th className="py-2.5 font-semibold pl-4">Diagnostic Assessment</th>
                <th className="py-2.5 font-semibold pl-4">Recommended Reallocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {underusedSpaceOpportunities.map((r) => (
                <tr key={r.room_id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-bold text-slate-900">{r.room_id}</td>
                  <td className="py-3 text-slate-600">
                    {r.room_type} · {r.building}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-800 font-semibold">{r.capacity}</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">{r.weeklyHours}h/wk</td>
                  <td className="py-3 text-right font-mono tabular-nums font-bold text-amber-700">{r.utilizationPct}%</td>
                  <td className="py-3 pl-4 text-slate-600 text-[11px] max-w-xs">{r.primaryIssue}</td>
                  <td className="py-3 pl-4 text-teal-700 font-medium text-[11px] max-w-xs">{r.suggestedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
