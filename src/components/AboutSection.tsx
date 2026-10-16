/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Database, Info, Code, FileText, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          About CampusSpace AI
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Datathon Track 2 (Education) solution documentation, data architecture, and algorithm methodology.
        </p>
      </div>

      {/* Challenge Statement Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs font-mono font-semibold">
          <span>DATATHON PROBLEM STATEMENT</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Track 2 — Education: “The Campus Has Space. Students Don’t.”
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Universities across the country face a recurring paradox: while academic departments and lecture halls sit vacant during non-peak blocks, student clubs, hackathon teams, and study groups frequently experience rejection or weeks-long waitlists. 
          The obstacle is rarely a physical shortage of bricks and mortar; rather, it is an <strong>information and allocation bottleneck</strong> characterized by manual approvals, rigid reservation silos, and a lack of intelligent space matching.
        </p>
      </div>

      {/* Dataset & Synthetic Data Disclosures */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          <span>Dataset Source of Truth & Join Schema</span>
        </h3>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            This application operates strictly on the 5 files supplied for the challenge:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 font-mono">1. rooms.csv (120 profiles)</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Defines building, floor, room_type, seating capacity, projector, computer workstations, ADA accessibility, and power outlet count.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 font-mono">2. class_schedule.csv (5,000 schedules)</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Weekly recurring curriculum allocations by room_id, course_code, weekday (Mon–Sat), start_hour, duration_hours, and department.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 font-mono">3. events.csv (1,800 events)</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Special campus events by room_id, event_type, start_time timestamp, duration_hours, expected_attendance, and actual attendance.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 font-mono">4. room_requests.csv (5,000 requests)</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Historical student booking demand records with request_date, time, required capacity, purpose, and final status (Approved, Waitlisted, etc.).
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Mandatory Data Disclosures:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800">
              <li>
                <strong>Synthetic Nature:</strong> This dataset is synthetic, not a live campus IoT telemetric system.
              </li>
              <li>
                <strong>No Guaranteed Room ID on Requests:</strong> As stated in README.txt, <code>room_requests.csv</code> logs student booking interest before room assignment. They represent unallocated campus demand.
              </li>
              <li>
                <strong>Estimated Availability:</strong> A room evaluated with zero schedule conflicts is an estimated candidate based on recorded intervals, not a guarantee of physical vacancy in real life.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Algorithmic Methodology */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-4 h-4 text-teal-600" />
          <span>Conflict Detection & Recommendation Math</span>
        </h3>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">1. Exact Interval Overlap Comparison</h4>
            <p>
              Two time windows <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[reqStart, reqEnd)</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[existStart, existEnd)</code> conflict if and only if:
            </p>
            <div className="my-2 p-2.5 bg-slate-900 text-teal-400 font-mono text-xs rounded-lg">
              reqStart &lt; existEnd &amp;&amp; existStart &lt; reqEnd
            </div>
            <p className="text-slate-500 text-[11px]">
              Adjacent non-overlapping boundaries (e.g., a class ending at 14:00 and a student booking starting at 14:00) satisfy <code className="font-mono">classEnd &le; reqStart</code> and are strictly treated as <strong>conflict-free</strong>.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-1">2. Recommendation Scoring Function (0 - 100)</h4>
            <p>
              Once all hard constraints (capacity, projector, computers, accessibility, power outlets, schedules, events) are passed, feasible rooms are scored:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
              <li><strong>Capacity Efficiency (40 pts):</strong> Proportional to <code className="font-mono">requested / room.capacity</code>. Rewards rightsized rooms while penalizing the wasteful booking of 150-seat halls for 10-person study groups.</li>
              <li><strong>Room Type Preference (20 pts):</strong> Max points for exact room_type match; neutral points for unspecified.</li>
              <li><strong>Facility Density (25 pts):</strong> Extra points for installed AV equipment, computer labs, and power outlet density.</li>
              <li><strong>Convenience & Location (15 pts):</strong> Building preference match and lower floor accessibility convenience.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
