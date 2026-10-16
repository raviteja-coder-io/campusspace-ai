/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Room, ClassSchedule, EventRecord, RoomSearchQuery, RoomRecommendation, ConflictRecord, ExclusionReason } from '../types/dataset';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getWeekdayFromDate = (dateStr: string): string => {
  if (!dateStr) return 'Mon';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 'Mon';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return WEEKDAYS[date.getDay()] || 'Mon';
};

export const evaluateRoomFeasibility = (
  room: Room,
  query: RoomSearchQuery,
  schedules: ClassSchedule[],
  events: EventRecord[]
): RoomRecommendation => {
  const conflicts: ConflictRecord[] = [];
  const exclusionReasons: ExclusionReason[] = [];

  const requestedStart = query.startHour;
  const requestedEnd = query.startHour + query.durationHours;
  const queryWeekday = getWeekdayFromDate(query.date);

  // 1. Mandatory Constraint A: Capacity Check
  if (room.capacity < query.requiredCapacity) {
    exclusionReasons.push({
      category: 'capacity',
      message: `Capacity too small (${room.capacity} seats vs. ${query.requiredCapacity} required)`,
      detail: `Room capacity is ${room.capacity}, but this booking needs at least ${query.requiredCapacity} seats.`,
    });
  }

  // 2. Mandatory Constraint B: Facility Checks
  if (query.projectorRequired && !room.projector) {
    exclusionReasons.push({
      category: 'facility',
      message: 'Missing required projector',
      detail: 'This request requires a ceiling/wall projector, which is not installed in this room.',
    });
  }

  if (query.computersRequired && !room.computers) {
    exclusionReasons.push({
      category: 'facility',
      message: 'Missing computer lab workstations',
      detail: 'This request requires computer terminals, but this is a standard non-computer room.',
    });
  }

  if (query.accessibleRequired && !room.accessible) {
    exclusionReasons.push({
      category: 'facility',
      message: 'Not wheelchair accessible',
      detail: 'This room lacks step-free entrance or ADA accessibility infrastructure.',
    });
  }

  if (query.minPowerOutlets > 0 && room.power_outlets < query.minPowerOutlets) {
    exclusionReasons.push({
      category: 'facility',
      message: `Insufficient power outlets (${room.power_outlets} available vs. ${query.minPowerOutlets} required)`,
      detail: `This room only has ${room.power_outlets} power outlets, failing the minimum requirement of ${query.minPowerOutlets}.`,
    });
  }

  // 3. Mandatory Constraint C: Class Schedule Conflict Detection
  // Only classes scheduled on this matching weekday
  const roomSchedules = schedules.filter(
    (s) => s.room_id === room.room_id && s.weekday.toLowerCase() === queryWeekday.toLowerCase()
  );

  for (const s of roomSchedules) {
    const classStart = s.start_hour;
    const classEnd = s.start_hour + s.duration_hours;

    // Interval overlap: requestedStart < classEnd && classStart < requestedEnd
    const overlaps = requestedStart < classEnd && classStart < requestedEnd;

    if (overlaps) {
      const conflict: ConflictRecord = {
        type: 'class',
        title: `Class ${s.course_code} (${s.department})`,
        startHour: classStart,
        endHour: classEnd,
        details: `Scheduled course ${s.course_code} with ${s.expected_attendance} expected attendees (${classStart}:00 - ${classEnd}:00)`,
      };
      conflicts.push(conflict);
      exclusionReasons.push({
        category: 'schedule_conflict',
        message: `Class conflict: ${s.course_code} from ${classStart}:00 to ${classEnd}:00`,
        detail: `The room is allocated for course ${s.course_code} (${s.department}) during ${classStart}:00–${classEnd}:00 every ${s.weekday}.`,
      });
    }
  }

  // 4. Mandatory Constraint D: Event Conflict Detection
  // Events occurring on the selected calendar date
  const roomEvents = events.filter((e) => {
    if (e.room_id !== room.room_id) return false;
    const eventDate = e.start_time.split(' ')[0] || e.start_time.split('T')[0];
    return eventDate === query.date;
  });

  for (const e of roomEvents) {
    // Parse time part
    const timePart = e.start_time.split(' ')[1] || e.start_time.split('T')[1] || '00:00:00';
    const [hh, mm] = timePart.split(':').map((v) => parseFloat(v) || 0);
    const eventStart = hh + mm / 60;
    const eventEnd = eventStart + e.duration_hours;

    const overlaps = requestedStart < eventEnd && eventStart < requestedEnd;

    if (overlaps) {
      const formattedStart = `${Math.floor(eventStart).toString().padStart(2, '0')}:${Math.round((eventStart % 1) * 60).toString().padStart(2, '0')}`;
      const formattedEnd = `${Math.floor(eventEnd).toString().padStart(2, '0')}:${Math.round((eventEnd % 1) * 60).toString().padStart(2, '0')}`;
      const conflict: ConflictRecord = {
        type: 'event',
        title: `Campus Event: ${e.event_type}`,
        startHour: eventStart,
        endHour: eventEnd,
        details: `${e.event_type} (${formattedStart} - ${formattedEnd}, ${e.expected_attendance} expected)`,
      };
      conflicts.push(conflict);
      exclusionReasons.push({
        category: 'event_conflict',
        message: `Event conflict: ${e.event_type} from ${formattedStart} to ${formattedEnd}`,
        detail: `Special event "${e.event_type}" is booked on ${query.date} between ${formattedStart} and ${formattedEnd}.`,
      });
    }
  }

  const isFeasible = exclusionReasons.length === 0;

  // Calculate Capacity-Fit Indicators
  const capacityFitPercentage = room.capacity > 0 ? Math.min(100, Math.round((query.requiredCapacity / room.capacity) * 100)) : 0;
  const capacityWasteSeats = Math.max(0, room.capacity - query.requiredCapacity);

  // Scoring Breakdown (0 - 100)
  // 1. Capacity Efficiency (Max 40 points)
  let capacityScore = 0;
  const fitRatio = room.capacity > 0 ? query.requiredCapacity / room.capacity : 0;
  if (fitRatio >= 0.8) {
    capacityScore = 40;
  } else if (fitRatio >= 0.65) {
    capacityScore = 36;
  } else if (fitRatio >= 0.5) {
    capacityScore = 30;
  } else if (fitRatio >= 0.35) {
    capacityScore = 22;
  } else if (fitRatio >= 0.2) {
    capacityScore = 15;
  } else {
    // Highly wasteful (e.g. 10 students in a 160 seat hall)
    capacityScore = 8;
  }

  // 2. Room Type Preference (Max 20 points)
  let typeScore = 15;
  if (query.preferredRoomType && query.preferredRoomType !== 'All') {
    if (room.room_type.toLowerCase() === query.preferredRoomType.toLowerCase()) {
      typeScore = 20;
    } else {
      typeScore = 8;
    }
  }

  // 3. Facility Bonus & Outlets (Max 25 points)
  let facilityScore = 0;
  if (room.projector) facilityScore += 6;
  if (room.computers) facilityScore += 6;
  if (room.accessible) facilityScore += 6;
  if (room.power_outlets >= 20) facilityScore += 7;
  else if (room.power_outlets >= 10) facilityScore += 5;
  else facilityScore += 2;

  // 4. Convenience & Building (Max 15 points)
  let convenienceScore = 8;
  if (query.preferredBuilding && query.preferredBuilding !== 'All') {
    if (room.building.toLowerCase() === query.preferredBuilding.toLowerCase()) {
      convenienceScore = 12;
    } else {
      convenienceScore = 4;
    }
  }
  // Floor accessibility convenience bonus
  if (room.floor <= 1) convenienceScore += 3;
  else if (room.floor <= 3) convenienceScore += 2;
  else convenienceScore += 1;

  convenienceScore = Math.min(15, convenienceScore);

  const totalScore = isFeasible ? Math.min(100, Math.round(capacityScore + typeScore + facilityScore + convenienceScore)) : 0;

  // Generate Transparent Evidence Reasons
  const evidenceReasons: string[] = [];
  if (isFeasible) {
    evidenceReasons.push(
      `Zero Schedule Conflicts: No class schedules or events recorded in synthetic data for ${queryWeekday}, ${requestedStart}:00–${requestedEnd}:00.`
    );
    evidenceReasons.push(
      `Capacity Fit ${capacityFitPercentage}%: Room accommodates ${query.requiredCapacity} requested attendees with ${capacityWasteSeats} buffer seat${capacityWasteSeats === 1 ? '' : 's'}.`
    );
    const facilityList = [];
    if (room.projector) facilityList.push('Projector');
    if (room.computers) facilityList.push('Computer Workstations');
    if (room.accessible) facilityList.push('ADA Accessible');
    facilityList.push(`${room.power_outlets} Power Outlets`);
    evidenceReasons.push(`Equipped Facilities: ${facilityList.join(', ')}.`);
    evidenceReasons.push(`Location Convenience: ${room.building} Building, Floor ${room.floor} (${room.room_type}).`);
  }

  return {
    room,
    isFeasible,
    recommendationScore: totalScore,
    capacityFitPercentage,
    capacityWasteSeats,
    conflicts,
    exclusionReasons,
    scoreBreakdown: {
      capacityScore,
      typeScore,
      facilityScore,
      convenienceScore,
    },
    evidenceReasons,
  };
};

export const searchAndRankRooms = (
  rooms: Room[],
  query: RoomSearchQuery,
  schedules: ClassSchedule[],
  events: EventRecord[]
): {
  feasibleRooms: RoomRecommendation[];
  excludedRooms: RoomRecommendation[];
  bestRecommendation: RoomRecommendation | null;
  totalEvaluated: number;
} => {
  const allEvaluations = rooms.map((room) => evaluateRoomFeasibility(room, query, schedules, events));

  const feasibleRooms = allEvaluations
    .filter((r) => r.isFeasible)
    .sort((a, b) => {
      // Primary: Score descending
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      // Secondary: Efficient capacity waste ascending (least wasted seats)
      return a.capacityWasteSeats - b.capacityWasteSeats;
    });

  const excludedRooms = allEvaluations.filter((r) => !r.isFeasible);

  return {
    feasibleRooms,
    excludedRooms,
    bestRecommendation: feasibleRooms.length > 0 ? feasibleRooms[0] : null,
    totalEvaluated: rooms.length,
  };
};
