/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Room, ClassSchedule, EventRecord, RoomRequest } from '../types/dataset';

export interface CampusAnalyticsSummary {
  totalRooms: number;
  totalCapacity: number;
  avgCapacity: number;
  accessiblePercentage: number;
  projectorPercentage: number;
  computersPercentage: number;
  totalScheduledClasses: number;
  totalEventsRecorded: number;
  totalRoomRequests: number;
  avgWeeklyScheduledHoursPerRoom: number;
  overallScheduledUtilizationPct: number;
  roomsByType: { type: string; count: number; totalCapacity: number }[];
  roomsByBuilding: { building: string; count: number; totalCapacity: number }[];
  schedulesByWeekday: { weekday: string; count: number; totalHours: number }[];
  schedulesByHour: { hour: number; count: number }[];
  schedulesByDepartment: { department: string; count: number; expectedAttendance: number }[];
  eventsByType: { type: string; count: number; expected: number; actual: number; realizationRate: number }[];
  requestsByStatus: { status: string; count: number; percentage: number }[];
  requestsByPurpose: { purpose: string; count: number; avgCapacity: number }[];
  requestsByHour: { hour: number; count: number }[];
  topUtilizedRooms: { room_id: string; building: string; room_type: string; capacity: number; weeklyHours: number; utilizationPct: number }[];
  leastUtilizedRooms: { room_id: string; building: string; room_type: string; capacity: number; weeklyHours: number; utilizationPct: number }[];
  underusedSpaceOpportunities: {
    room_id: string;
    building: string;
    room_type: string;
    capacity: number;
    weeklyHours: number;
    utilizationPct: number;
    primaryIssue: string;
    suggestedAction: string;
  }[];
}

// Operating baseline: 6 days/week (Mon-Sat), 10 active academic hours/day (08:00 - 18:00) = 60 hours/week denominator
const WEEKLY_OPERATING_HOURS = 60;

export const computeCampusAnalytics = (
  rooms: Room[],
  schedules: ClassSchedule[],
  events: EventRecord[],
  requests: RoomRequest[]
): CampusAnalyticsSummary => {
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const avgCapacity = totalRooms > 0 ? Math.round(totalCapacity / totalRooms) : 0;

  const accessibleCount = rooms.filter((r) => r.accessible).length;
  const projectorCount = rooms.filter((r) => r.projector).length;
  const computersCount = rooms.filter((r) => r.computers).length;

  const accessiblePercentage = totalRooms > 0 ? Math.round((accessibleCount / totalRooms) * 100) : 0;
  const projectorPercentage = totalRooms > 0 ? Math.round((projectorCount / totalRooms) * 100) : 0;
  const computersPercentage = totalRooms > 0 ? Math.round((computersCount / totalRooms) * 100) : 0;

  // 1. Rooms by Type
  const typeMap: Record<string, { count: number; totalCapacity: number }> = {};
  rooms.forEach((r) => {
    if (!typeMap[r.room_type]) {
      typeMap[r.room_type] = { count: 0, totalCapacity: 0 };
    }
    typeMap[r.room_type].count += 1;
    typeMap[r.room_type].totalCapacity += r.capacity;
  });
  const roomsByType = Object.entries(typeMap).map(([type, val]) => ({
    type,
    count: val.count,
    totalCapacity: val.totalCapacity,
  })).sort((a, b) => b.count - a.count);

  // 2. Rooms by Building
  const buildingMap: Record<string, { count: number; totalCapacity: number }> = {};
  rooms.forEach((r) => {
    if (!buildingMap[r.building]) {
      buildingMap[r.building] = { count: 0, totalCapacity: 0 };
    }
    buildingMap[r.building].count += 1;
    buildingMap[r.building].totalCapacity += r.capacity;
  });
  const roomsByBuilding = Object.entries(buildingMap).map(([building, val]) => ({
    building,
    count: val.count,
    totalCapacity: val.totalCapacity,
  })).sort((a, b) => b.count - a.count);

  // 3. Schedules by Weekday
  const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayMap: Record<string, { count: number; totalHours: number }> = {
    Mon: { count: 0, totalHours: 0 },
    Tue: { count: 0, totalHours: 0 },
    Wed: { count: 0, totalHours: 0 },
    Thu: { count: 0, totalHours: 0 },
    Fri: { count: 0, totalHours: 0 },
    Sat: { count: 0, totalHours: 0 },
  };
  schedules.forEach((s) => {
    const w = s.weekday || 'Mon';
    if (weekdayMap[w]) {
      weekdayMap[w].count += 1;
      weekdayMap[w].totalHours += s.duration_hours;
    }
  });
  const schedulesByWeekday = weekdayOrder.map((weekday) => ({
    weekday,
    count: weekdayMap[weekday].count,
    totalHours: weekdayMap[weekday].totalHours,
  }));

  // 4. Schedules by Hour
  const hourMap: Record<number, number> = {};
  for (let h = 8; h <= 18; h++) hourMap[h] = 0;
  schedules.forEach((s) => {
    if (hourMap[s.start_hour] !== undefined) {
      hourMap[s.start_hour] += 1;
    }
  });
  const schedulesByHour = Object.entries(hourMap).map(([h, count]) => ({
    hour: parseInt(h, 10),
    count,
  })).sort((a, b) => a.hour - b.hour);

  // 5. Schedules by Department
  const deptMap: Record<string, { count: number; expectedAttendance: number }> = {};
  schedules.forEach((s) => {
    const d = s.department || 'General';
    if (!deptMap[d]) deptMap[d] = { count: 0, expectedAttendance: 0 };
    deptMap[d].count += 1;
    deptMap[d].expectedAttendance += s.expected_attendance;
  });
  const schedulesByDepartment = Object.entries(deptMap).map(([department, val]) => ({
    department,
    count: val.count,
    expectedAttendance: val.expectedAttendance,
  })).sort((a, b) => b.count - a.count);

  // 6. Events Attendance Expected vs Actual
  const eventTypeMap: Record<string, { count: number; expected: number; actual: number }> = {};
  events.forEach((e) => {
    const t = e.event_type || 'Event';
    if (!eventTypeMap[t]) eventTypeMap[t] = { count: 0, expected: 0, actual: 0 };
    eventTypeMap[t].count += 1;
    eventTypeMap[t].expected += e.expected_attendance;
    eventTypeMap[t].actual += e.actual_attendance;
  });
  const eventsByType = Object.entries(eventTypeMap).map(([type, val]) => ({
    type,
    count: val.count,
    expected: val.expected,
    actual: val.actual,
    realizationRate: val.expected > 0 ? Math.round((val.actual / val.expected) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // 7. Requests by Status & Purpose
  const statusMap: Record<string, number> = {};
  const purposeMap: Record<string, { count: number; totalCap: number }> = {};
  const reqHourMap: Record<number, number> = {};
  for (let h = 8; h <= 20; h++) reqHourMap[h] = 0;

  requests.forEach((r) => {
    const st = r.status || 'Waitlisted';
    statusMap[st] = (statusMap[st] || 0) + 1;

    const purp = r.purpose || 'General';
    if (!purposeMap[purp]) purposeMap[purp] = { count: 0, totalCap: 0 };
    purposeMap[purp].count += 1;
    purposeMap[purp].totalCap += r.required_capacity;

    if (reqHourMap[r.start_hour] !== undefined) {
      reqHourMap[r.start_hour] += 1;
    }
  });

  const totalReq = requests.length;
  const requestsByStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
    percentage: totalReq > 0 ? Math.round((count / totalReq) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const requestsByPurpose = Object.entries(purposeMap).map(([purpose, val]) => ({
    purpose,
    count: val.count,
    avgCapacity: val.count > 0 ? Math.round(val.totalCap / val.count) : 0,
  })).sort((a, b) => b.count - a.count);

  const requestsByHour = Object.entries(reqHourMap).map(([h, count]) => ({
    hour: parseInt(h, 10),
    count,
  })).sort((a, b) => a.hour - b.hour);

  // 8. Room Utilization Calculations
  // Calculate total weekly scheduled hours per room from recurring class schedule
  const roomWeeklyHoursMap: Record<string, number> = {};
  rooms.forEach((r) => {
    roomWeeklyHoursMap[r.room_id] = 0;
  });
  schedules.forEach((s) => {
    if (roomWeeklyHoursMap[s.room_id] !== undefined) {
      roomWeeklyHoursMap[s.room_id] += s.duration_hours;
    }
  });

  const roomUtilizationList = rooms.map((r) => {
    const weeklyHours = roomWeeklyHoursMap[r.room_id] || 0;
    // Utilization as % of weekly operating capacity (capped at 100% for metric display)
    const utilizationPct = Math.min(100, Math.round((weeklyHours / WEEKLY_OPERATING_HOURS) * 100));
    return {
      room_id: r.room_id,
      building: r.building,
      room_type: r.room_type,
      capacity: r.capacity,
      weeklyHours,
      utilizationPct,
    };
  });

  const sortedByUtil = [...roomUtilizationList].sort((a, b) => b.weeklyHours - a.weeklyHours);
  const topUtilizedRooms = sortedByUtil.slice(0, 10);
  const leastUtilizedRooms = [...sortedByUtil].reverse().slice(0, 10);

  const totalWeeklyHoursAllRooms = roomUtilizationList.reduce((acc, r) => acc + r.weeklyHours, 0);
  const avgWeeklyScheduledHoursPerRoom = totalRooms > 0 ? Math.round((totalWeeklyHoursAllRooms / totalRooms) * 10) / 10 : 0;
  const overallScheduledUtilizationPct = totalRooms > 0 ? Math.round((totalWeeklyHoursAllRooms / (totalRooms * WEEKLY_OPERATING_HOURS)) * 100) : 0;

  // 9. Underused Space Diagnostic & Better Allocation
  const underusedSpaceOpportunities = roomUtilizationList
    .filter((r) => r.utilizationPct < 40)
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 8)
    .map((r) => {
      let primaryIssue = 'Low scheduled block density during prime daytime slots';
      let suggestedAction = 'Eligible for student club reservations and evening study pods';

      if (r.capacity >= 100) {
        primaryIssue = 'Large-capacity venue under-utilized during weekdays';
        suggestedAction = 'Reallocate for large guest lectures or multi-section study groups';
      } else if (r.room_type === 'Lab') {
        primaryIssue = 'Specialized lab idle during non-lab periods';
        suggestedAction = 'Open for scheduled open-door student computing hours';
      } else if (r.weeklyHours < 15) {
        primaryIssue = 'Severely underused (<15 scheduled hours/week)';
        suggestedAction = 'Priority candidate to absorb waitlisted student project requests';
      }

      return {
        ...r,
        primaryIssue,
        suggestedAction,
      };
    });

  return {
    totalRooms,
    totalCapacity,
    avgCapacity,
    accessiblePercentage,
    projectorPercentage,
    computersPercentage,
    totalScheduledClasses: schedules.length,
    totalEventsRecorded: events.length,
    totalRoomRequests: requests.length,
    avgWeeklyScheduledHoursPerRoom,
    overallScheduledUtilizationPct,
    roomsByType,
    roomsByBuilding,
    schedulesByWeekday,
    schedulesByHour,
    schedulesByDepartment,
    eventsByType,
    requestsByStatus,
    requestsByPurpose,
    requestsByHour,
    topUtilizedRooms,
    leastUtilizedRooms,
    underusedSpaceOpportunities,
  };
};
