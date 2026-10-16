/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  FileSpreadsheet,
  Check,
  AlertTriangle
} from 'lucide-react';
import { DatasetStatus, Room, ClassSchedule, EventRecord, RoomRequest } from '../types/dataset';
import { setUploadedDataset, loadDatasets } from '../services/dataLoader';

interface DatasetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetStatus: DatasetStatus;
  rooms: Room[];
  schedules: ClassSchedule[];
  events: EventRecord[];
  requests: RoomRequest[];
  onDataUpdated: () => void;
}

export const DatasetManagerModal: React.FC<DatasetManagerModalProps> = ({
  isOpen,
  onClose,
  datasetStatus,
  rooms,
  schedules,
  events,
  requests,
  onDataUpdated,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<'rooms' | 'schedules' | 'events' | 'requests'>('rooms');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (
    type: 'rooms' | 'schedules' | 'events' | 'requests',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setUploadError('Uploaded file was empty.');
        return;
      }

      const result = setUploadedDataset(type, text);
      if (result.success) {
        setUploadSuccess(`Successfully loaded ${result.count} rows into ${type}.csv!`);
        onDataUpdated();
      } else {
        setUploadError(`Schema Error in ${type}.csv: ${result.errors.join('; ')}`);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file from local disk.');
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleResetToBaseline = async () => {
    setIsReloading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      await loadDatasets(true);
      onDataUpdated();
      setUploadSuccess('Successfully reloaded official baseline datasets from /data/');
    } catch (err) {
      setUploadError('Failed to reload baseline datasets.');
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-lg">
              <Database className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ground Truth Dataset Manager
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect raw data files, upload replacement CSVs, or verify schema integrity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Status feedback */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Validation Error: </span>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* 4 Files Grid & Upload Affordance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* File 1: rooms.csv */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-slate-900">rooms.csv</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                  Valid
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {rooms.length} <span className="text-xs text-slate-400 font-normal">records</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <label className="flex-1 py-1 px-2 text-[11px] text-center font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer transition-colors">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('rooms', e)}
                  />
                </label>
                <a
                  href="/data/rooms.csv"
                  download="rooms.csv"
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title="Download rooms.csv"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* File 2: class_schedule.csv */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-slate-900">class_schedule.csv</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                  Valid
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {schedules.length.toLocaleString()} <span className="text-xs text-slate-400 font-normal">records</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <label className="flex-1 py-1 px-2 text-[11px] text-center font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer transition-colors">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('schedules', e)}
                  />
                </label>
                <a
                  href="/data/class_schedule.csv"
                  download="class_schedule.csv"
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title="Download class_schedule.csv"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* File 3: events.csv */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-slate-900">events.csv</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                  Valid
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {events.length.toLocaleString()} <span className="text-xs text-slate-400 font-normal">records</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <label className="flex-1 py-1 px-2 text-[11px] text-center font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer transition-colors">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('events', e)}
                  />
                </label>
                <a
                  href="/data/events.csv"
                  download="events.csv"
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title="Download events.csv"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* File 4: room_requests.csv */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-slate-900">room_requests.csv</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                  Valid
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {requests.length.toLocaleString()} <span className="text-xs text-slate-400 font-normal">records</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <label className="flex-1 py-1 px-2 text-[11px] text-center font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer transition-colors">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('requests', e)}
                  />
                </label>
                <a
                  href="/data/room_requests.csv"
                  download="room_requests.csv"
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title="Download room_requests.csv"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Raw Data Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Preview Data Table:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setSelectedPreview('rooms')}
                    className={`px-2.5 py-1 rounded-md font-mono ${selectedPreview === 'rooms' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    rooms.csv
                  </button>
                  <button
                    onClick={() => setSelectedPreview('schedules')}
                    className={`px-2.5 py-1 rounded-md font-mono ${selectedPreview === 'schedules' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    class_schedule.csv
                  </button>
                  <button
                    onClick={() => setSelectedPreview('events')}
                    className={`px-2.5 py-1 rounded-md font-mono ${selectedPreview === 'events' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    events.csv
                  </button>
                  <button
                    onClick={() => setSelectedPreview('requests')}
                    className={`px-2.5 py-1 rounded-md font-mono ${selectedPreview === 'requests' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    room_requests.csv
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {selectedPreview === 'rooms' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 font-mono">room_id</th>
                      <th className="p-2">building</th>
                      <th className="p-2">floor</th>
                      <th className="p-2">room_type</th>
                      <th className="p-2 text-right">capacity</th>
                      <th className="p-2 text-center">projector</th>
                      <th className="p-2 text-center">computers</th>
                      <th className="p-2 text-center">accessible</th>
                      <th className="p-2 text-right">power_outlets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {rooms.slice(0, 10).map((r) => (
                      <tr key={r.room_id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{r.room_id}</td>
                        <td className="p-2 font-sans">{r.building}</td>
                        <td className="p-2">{r.floor}</td>
                        <td className="p-2 font-sans">{r.room_type}</td>
                        <td className="p-2 text-right tabular-nums">{r.capacity}</td>
                        <td className="p-2 text-center">{r.projector ? '1' : '0'}</td>
                        <td className="p-2 text-center">{r.computers ? '1' : '0'}</td>
                        <td className="p-2 text-center">{r.accessible ? '1' : '0'}</td>
                        <td className="p-2 text-right tabular-nums">{r.power_outlets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedPreview === 'schedules' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 font-mono">schedule_id</th>
                      <th className="p-2 font-mono">room_id</th>
                      <th className="p-2 font-mono">course_code</th>
                      <th className="p-2">weekday</th>
                      <th className="p-2 text-right">start_hour</th>
                      <th className="p-2 text-right">duration_hours</th>
                      <th className="p-2 text-right">expected_attendance</th>
                      <th className="p-2">department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {schedules.slice(0, 10).map((s) => (
                      <tr key={s.schedule_id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{s.schedule_id}</td>
                        <td className="p-2">{s.room_id}</td>
                        <td className="p-2">{s.course_code}</td>
                        <td className="p-2 font-sans">{s.weekday}</td>
                        <td className="p-2 text-right tabular-nums">{s.start_hour}:00</td>
                        <td className="p-2 text-right tabular-nums">{s.duration_hours}h</td>
                        <td className="p-2 text-right tabular-nums">{s.expected_attendance}</td>
                        <td className="p-2 font-sans">{s.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedPreview === 'events' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 font-mono">event_id</th>
                      <th className="p-2 font-mono">room_id</th>
                      <th className="p-2">event_type</th>
                      <th className="p-2 font-mono">start_time</th>
                      <th className="p-2 text-right">duration_hours</th>
                      <th className="p-2 text-right">expected_att</th>
                      <th className="p-2 text-right">actual_att</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {events.slice(0, 10).map((e) => (
                      <tr key={e.event_id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{e.event_id}</td>
                        <td className="p-2">{e.room_id}</td>
                        <td className="p-2 font-sans">{e.event_type}</td>
                        <td className="p-2">{e.start_time}</td>
                        <td className="p-2 text-right tabular-nums">{e.duration_hours}h</td>
                        <td className="p-2 text-right tabular-nums">{e.expected_attendance}</td>
                        <td className="p-2 text-right tabular-nums font-bold text-teal-700">{e.actual_attendance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedPreview === 'requests' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 font-mono">request_id</th>
                      <th className="p-2 font-mono">request_date</th>
                      <th className="p-2 text-right">start_hour</th>
                      <th className="p-2 text-right">duration</th>
                      <th className="p-2 text-right">required_cap</th>
                      <th className="p-2">purpose</th>
                      <th className="p-2">status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {requests.slice(0, 10).map((q) => (
                      <tr key={q.request_id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{q.request_id}</td>
                        <td className="p-2">{q.request_date}</td>
                        <td className="p-2 text-right tabular-nums">{q.start_hour}:00</td>
                        <td className="p-2 text-right tabular-nums">{q.duration_hours}h</td>
                        <td className="p-2 text-right tabular-nums">{q.required_capacity}</td>
                        <td className="p-2 font-sans">{q.purpose}</td>
                        <td className="p-2 font-sans">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            q.status === 'Waitlisted' ? 'bg-amber-50 text-amber-700' :
                            q.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleResetToBaseline}
            disabled={isReloading}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span>Reset to Official Datathon Baseline</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
