/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Tv, 
  Monitor, 
  Accessibility, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Calendar,
  Info
} from 'lucide-react';
import { RoomRecommendation } from '../types/dataset';

interface RoomCardProps {
  recommendation: RoomRecommendation;
  requestedCapacity: number;
  rank?: number;
  onSelectForDetails?: (recommendation: RoomRecommendation) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  recommendation,
  requestedCapacity,
  rank,
  onSelectForDetails,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const { room, isFeasible, recommendationScore, capacityFitPercentage, conflicts, exclusionReasons, scoreBreakdown, evidenceReasons } = recommendation;

  // Score color badge
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 70) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (score >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${
      isFeasible 
        ? 'border-slate-200 hover:border-teal-300 hover:shadow-md' 
        : 'border-slate-200/80 bg-slate-50/50 opacity-90'
    }`}>
      <div className="p-5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            {rank !== undefined && (
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                #{rank}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                  {room.room_id}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {room.building} Building · Floor {room.floor}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">{room.room_type}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{room.capacity} seats</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>{capacityFitPercentage}% fit for {requestedCapacity} req</span>
              </div>
            </div>
          </div>

          {/* Feasibility & Score */}
          <div className="flex items-center gap-2 shrink-0">
            {isFeasible ? (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Feasible</span>
                </div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${getScoreBadgeClass(recommendationScore)}`}>
                    Score: {recommendationScore}/100
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-700">Excluded</span>
                </div>
                <span className="inline-block mt-1 text-[11px] text-slate-500 font-mono">
                  {exclusionReasons.length} constraint failure{exclusionReasons.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Utilization Visual Bar */}
        <div className="my-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Capacity Utilization</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {requestedCapacity} / {room.capacity} seats ({capacityFitPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                !isFeasible 
                  ? 'bg-rose-400' 
                  : capacityFitPercentage > 90 
                    ? 'bg-amber-500' 
                    : capacityFitPercentage >= 65 
                      ? 'bg-teal-500' 
                      : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min(100, capacityFitPercentage)}%` }}
            />
          </div>
        </div>

        {/* Facilities Indicators */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className={`flex items-center gap-1 ${room.projector ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
            <Tv className="w-3.5 h-3.5 text-teal-600" />
            <span>Projector</span>
          </div>
          <div className={`flex items-center gap-1 ${room.computers ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
            <Monitor className="w-3.5 h-3.5 text-teal-600" />
            <span>Computers</span>
          </div>
          <div className={`flex items-center gap-1 ${room.accessible ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
            <Accessibility className="w-3.5 h-3.5 text-teal-600" />
            <span>Accessible</span>
          </div>
          <div className="flex items-center gap-1 text-slate-800 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono tabular-nums">{room.power_outlets} Outlets</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {onSelectForDetails && (
              <button
                onClick={() => onSelectForDetails(recommendation)}
                className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Inspect Schedule
              </button>
            )}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-medium transition-colors cursor-pointer"
            >
              <span>{showExplanation ? 'Hide Evidence' : 'View Evidence'}</span>
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary Failure Banner if Excluded */}
        {!isFeasible && exclusionReasons.length > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-800">
            <div className="font-semibold mb-0.5 flex items-center gap-1.5">
              <span>Primary Exclusion Factor:</span>
            </div>
            <p className="text-rose-700 font-medium">{exclusionReasons[0].message}</p>
          </div>
        )}

        {/* Expandable Explanation Panel (Feature 3: Explainable Recommendations) */}
        {showExplanation && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-3 animate-in fade-in duration-150">
            {isFeasible ? (
              <>
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Evidence Supporting This Recommendation:
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
                    {evidenceReasons.map((reason, idx) => (
                      <li key={idx} className="leading-relaxed">{reason}</li>
                    ))}
                  </ul>
                </div>

                {/* Score Breakdown Table */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Recommendation Score Breakdown:</span>
                    <span className="font-mono font-bold text-teal-700">{recommendationScore} / 100 pts</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-400">Capacity Fit</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {scoreBreakdown.capacityScore} / 40
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-400">Type Preference</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {scoreBreakdown.typeScore} / 20
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-400">Facilities / Outlets</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {scoreBreakdown.facilityScore} / 25
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-400">Location Convenience</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {scoreBreakdown.convenienceScore} / 15
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-teal-50/50 p-2 rounded border border-teal-100">
                  <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    Estimated availability assessment grounded in synthetic class_schedule.csv and events.csv records. Real-world IoT presence sensors may vary.
                  </span>
                </div>
              </>
            ) : (
              <div>
                <h4 className="font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Detailed Exclusion Invariants ({exclusionReasons.length}):
                </h4>
                <div className="space-y-2">
                  {exclusionReasons.map((reason, idx) => (
                    <div key={idx} className="p-2 rounded bg-rose-50/70 border border-rose-200/70">
                      <div className="font-semibold text-rose-800">{reason.message}</div>
                      <div className="text-rose-700/90 text-[11px] mt-0.5">{reason.detail}</div>
                    </div>
                  ))}
                </div>

                {conflicts.length > 0 && (
                  <div className="mt-3">
                    <div className="font-semibold text-slate-700 mb-1.5">Identified Schedule Overlaps:</div>
                    <div className="space-y-1.5">
                      {conflicts.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-mono font-medium text-slate-800">
                            {c.startHour}:00 - {c.endHour}:00
                          </span>
                          <span>{c.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
