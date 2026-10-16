/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Room {
  room_id: string;
  building: string;
  floor: number;
  room_type: 'Classroom' | 'Lab' | 'Seminar' | 'Study room' | 'Auditorium' | string;
  capacity: number;
  projector: boolean;
  computers: boolean;
  accessible: boolean;
  power_outlets: number;
}

export interface ClassSchedule {
  schedule_id: string;
  room_id: string;
  course_code: string;
  weekday: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | string;
  start_hour: number;
  duration_hours: number;
  expected_attendance: number;
  department: string;
}

export interface EventRecord {
  event_id: string;
  room_id: string;
  event_type: 'Guest lecture' | 'Seminar' | 'Club meeting' | 'Exam' | 'Workshop' | string;
  start_time: string; // YYYY-MM-DD HH:mm:ss
  duration_hours: number;
  expected_attendance: number;
  actual_attendance: number;
}

export interface RoomRequest {
  request_id: string;
  request_date: string; // YYYY-MM-DD
  start_hour: number;
  duration_hours: number;
  required_capacity: number;
  projector_required: boolean;
  computers_required: boolean;
  purpose: 'Study group' | 'Class' | 'Workshop' | 'Club meeting' | 'Project work' | string;
  status: 'Approved' | 'Waitlisted' | 'Rejected' | 'Cancelled' | string;
}

export interface RoomSearchQuery {
  date: string; // YYYY-MM-DD
  startHour: number; // 8 - 21
  durationHours: number; // 1 - 8
  requiredCapacity: number;
  preferredRoomType?: string; // 'All' or specific type
  preferredBuilding?: string; // 'All' or specific building
  projectorRequired: boolean;
  computersRequired: boolean;
  accessibleRequired: boolean;
  minPowerOutlets: number;
}

export interface ConflictRecord {
  type: 'class' | 'event';
  title: string;
  startHour: number;
  endHour: number;
  details: string;
}

export interface ExclusionReason {
  category: 'capacity' | 'facility' | 'schedule_conflict' | 'event_conflict';
  message: string;
  detail: string;
}

export interface RoomRecommendation {
  room: Room;
  isFeasible: boolean;
  recommendationScore: number; // 0 - 100
  capacityFitPercentage: number; // (requested / room.capacity) * 100
  capacityWasteSeats: number;
  conflicts: ConflictRecord[];
  exclusionReasons: ExclusionReason[];
  scoreBreakdown: {
    capacityScore: number; // max 40
    typeScore: number;     // max 20
    facilityScore: number; // max 25
    convenienceScore: number; // max 15
  };
  evidenceReasons: string[];
}

export interface DatasetStatus {
  roomsCount: number;
  schedulesCount: number;
  eventsCount: number;
  requestsCount: number;
  loadedAt: Date;
  source: 'official' | 'uploaded' | 'cached';
  errors: string[];
}
