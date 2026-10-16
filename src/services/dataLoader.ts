/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { Room, ClassSchedule, EventRecord, RoomRequest, DatasetStatus } from '../types/dataset';

// In-memory cache of parsed datasets
let cachedRooms: Room[] = [];
let cachedSchedules: ClassSchedule[] = [];
let cachedEvents: EventRecord[] = [];
let cachedRequests: RoomRequest[] = [];
let datasetStatus: DatasetStatus = {
  roomsCount: 0,
  schedulesCount: 0,
  eventsCount: 0,
  requestsCount: 0,
  loadedAt: new Date(),
  source: 'official',
  errors: [],
};

const parseBool = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes';
  }
  return false;
};

const parseNum = (val: unknown, fallback = 0): number => {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const n = parseFloat(val.trim());
    return isNaN(n) ? fallback : n;
  }
  return fallback;
};

export const parseRoomsCSV = (csvText: string): { data: Room[]; errors: string[] } => {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const requiredCols = ['room_id', 'building', 'floor', 'room_type', 'capacity', 'projector', 'computers', 'accessible', 'power_outlets'];

  if (result.data.length > 0) {
    const headers = Object.keys(result.data[0]);
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        errors.push(`Missing required column in rooms.csv: ${col}`);
      }
    }
  } else {
    errors.push('rooms.csv has no rows.');
  }

  const data: Room[] = result.data.map((row) => ({
    room_id: (row.room_id || '').trim(),
    building: (row.building || '').trim(),
    floor: parseNum(row.floor, 0),
    room_type: (row.room_type || 'Classroom').trim(),
    capacity: parseNum(row.capacity, 0),
    projector: parseBool(row.projector),
    computers: parseBool(row.computers),
    accessible: parseBool(row.accessible),
    power_outlets: parseNum(row.power_outlets, 0),
  })).filter(r => r.room_id.length > 0);

  return { data, errors };
};

export const parseClassScheduleCSV = (csvText: string): { data: ClassSchedule[]; errors: string[] } => {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const requiredCols = ['schedule_id', 'room_id', 'course_code', 'weekday', 'start_hour', 'duration_hours', 'expected_attendance', 'department'];

  if (result.data.length > 0) {
    const headers = Object.keys(result.data[0]);
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        errors.push(`Missing required column in class_schedule.csv: ${col}`);
      }
    }
  } else {
    errors.push('class_schedule.csv has no rows.');
  }

  const data: ClassSchedule[] = result.data.map((row) => ({
    schedule_id: (row.schedule_id || '').trim(),
    room_id: (row.room_id || '').trim(),
    course_code: (row.course_code || '').trim(),
    weekday: (row.weekday || 'Mon').trim(),
    start_hour: parseNum(row.start_hour, 8),
    duration_hours: parseNum(row.duration_hours, 1),
    expected_attendance: parseNum(row.expected_attendance, 0),
    department: (row.department || 'General').trim(),
  })).filter(s => s.schedule_id.length > 0 && s.room_id.length > 0);

  return { data, errors };
};

export const parseEventsCSV = (csvText: string): { data: EventRecord[]; errors: string[] } => {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const requiredCols = ['event_id', 'room_id', 'event_type', 'start_time', 'duration_hours', 'expected_attendance', 'actual_attendance'];

  if (result.data.length > 0) {
    const headers = Object.keys(result.data[0]);
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        errors.push(`Missing required column in events.csv: ${col}`);
      }
    }
  } else {
    errors.push('events.csv has no rows.');
  }

  const data: EventRecord[] = result.data.map((row) => ({
    event_id: (row.event_id || '').trim(),
    room_id: (row.room_id || '').trim(),
    event_type: (row.event_type || 'Event').trim(),
    start_time: (row.start_time || '').trim(),
    duration_hours: parseNum(row.duration_hours, 1),
    expected_attendance: parseNum(row.expected_attendance, 0),
    actual_attendance: parseNum(row.actual_attendance, 0),
  })).filter(e => e.event_id.length > 0 && e.room_id.length > 0);

  return { data, errors };
};

export const parseRoomRequestsCSV = (csvText: string): { data: RoomRequest[]; errors: string[] } => {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const requiredCols = ['request_id', 'request_date', 'start_hour', 'duration_hours', 'required_capacity', 'projector_required', 'computers_required', 'purpose', 'status'];

  if (result.data.length > 0) {
    const headers = Object.keys(result.data[0]);
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        errors.push(`Missing required column in room_requests.csv: ${col}`);
      }
    }
  } else {
    errors.push('room_requests.csv has no rows.');
  }

  const data: RoomRequest[] = result.data.map((row) => ({
    request_id: (row.request_id || '').trim(),
    request_date: (row.request_date || '').trim(),
    start_hour: parseNum(row.start_hour, 8),
    duration_hours: parseNum(row.duration_hours, 1),
    required_capacity: parseNum(row.required_capacity, 1),
    projector_required: parseBool(row.projector_required),
    computers_required: parseBool(row.computers_required),
    purpose: (row.purpose || 'General').trim(),
    status: (row.status || 'Waitlisted').trim(),
  })).filter(q => q.request_id.length > 0);

  return { data, errors };
};

export const loadDatasets = async (forceReload = false): Promise<{
  rooms: Room[];
  schedules: ClassSchedule[];
  events: EventRecord[];
  requests: RoomRequest[];
  status: DatasetStatus;
}> => {
  if (
    !forceReload &&
    cachedRooms.length > 0 &&
    cachedSchedules.length > 0 &&
    cachedEvents.length > 0 &&
    cachedRequests.length > 0
  ) {
    return {
      rooms: cachedRooms,
      schedules: cachedSchedules,
      events: cachedEvents,
      requests: cachedRequests,
      status: datasetStatus,
    };
  }

  const errors: string[] = [];

  try {
    const [roomsRes, schedRes, eventsRes, reqRes] = await Promise.all([
      fetch('/data/rooms.csv'),
      fetch('/data/class_schedule.csv'),
      fetch('/data/events.csv'),
      fetch('/data/room_requests.csv'),
    ]);

    if (!roomsRes.ok) errors.push(`Failed to load rooms.csv (${roomsRes.statusText})`);
    if (!schedRes.ok) errors.push(`Failed to load class_schedule.csv (${schedRes.statusText})`);
    if (!eventsRes.ok) errors.push(`Failed to load events.csv (${eventsRes.statusText})`);
    if (!reqRes.ok) errors.push(`Failed to load room_requests.csv (${reqRes.statusText})`);

    const [roomsText, schedText, eventsText, reqText] = await Promise.all([
      roomsRes.text(),
      schedRes.text(),
      eventsRes.text(),
      reqRes.text(),
    ]);

    const parsedRooms = parseRoomsCSV(roomsText);
    const parsedSched = parseClassScheduleCSV(schedText);
    const parsedEvents = parseEventsCSV(eventsText);
    const parsedReq = parseRoomRequestsCSV(reqText);

    errors.push(...parsedRooms.errors, ...parsedSched.errors, ...parsedEvents.errors, ...parsedReq.errors);

    cachedRooms = parsedRooms.data;
    cachedSchedules = parsedSched.data;
    cachedEvents = parsedEvents.data;
    cachedRequests = parsedReq.data;

    datasetStatus = {
      roomsCount: cachedRooms.length,
      schedulesCount: cachedSchedules.length,
      eventsCount: cachedEvents.length,
      requestsCount: cachedRequests.length,
      loadedAt: new Date(),
      source: 'official',
      errors,
    };
  } catch (err) {
    errors.push(`Data loading network error: ${err instanceof Error ? err.message : String(err)}`);
    datasetStatus.errors = errors;
  }

  return {
    rooms: cachedRooms,
    schedules: cachedSchedules,
    events: cachedEvents,
    requests: cachedRequests,
    status: datasetStatus,
  };
};

export const setUploadedDataset = (
  type: 'rooms' | 'schedules' | 'events' | 'requests',
  csvText: string
): { success: boolean; count: number; errors: string[] } => {
  let errors: string[] = [];
  let count = 0;

  if (type === 'rooms') {
    const parsed = parseRoomsCSV(csvText);
    if (parsed.errors.length === 0 && parsed.data.length > 0) {
      cachedRooms = parsed.data;
      datasetStatus.roomsCount = parsed.data.length;
      count = parsed.data.length;
    } else {
      errors = parsed.errors;
    }
  } else if (type === 'schedules') {
    const parsed = parseClassScheduleCSV(csvText);
    if (parsed.errors.length === 0 && parsed.data.length > 0) {
      cachedSchedules = parsed.data;
      datasetStatus.schedulesCount = parsed.data.length;
      count = parsed.data.length;
    } else {
      errors = parsed.errors;
    }
  } else if (type === 'events') {
    const parsed = parseEventsCSV(csvText);
    if (parsed.errors.length === 0 && parsed.data.length > 0) {
      cachedEvents = parsed.data;
      datasetStatus.eventsCount = parsed.data.length;
      count = parsed.data.length;
    } else {
      errors = parsed.errors;
    }
  } else if (type === 'requests') {
    const parsed = parseRoomRequestsCSV(csvText);
    if (parsed.errors.length === 0 && parsed.data.length > 0) {
      cachedRequests = parsed.data;
      datasetStatus.requestsCount = parsed.data.length;
      count = parsed.data.length;
    } else {
      errors = parsed.errors;
    }
  }

  if (errors.length === 0) {
    datasetStatus.source = 'uploaded';
    datasetStatus.loadedAt = new Date();
    return { success: true, count, errors: [] };
  }

  return { success: false, count: 0, errors };
};

export const getCachedData = () => ({
  rooms: cachedRooms,
  schedules: cachedSchedules,
  events: cachedEvents,
  requests: cachedRequests,
  status: datasetStatus,
});
