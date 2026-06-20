export type UserRole = 'admin' | 'supervisor' | 'cleaner';

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave';

export type RoomStatus = 'clean' | 'dirty' | 'in_progress' | 'pending_verification' | 'overdue';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export type TaskStatus =
  | 'assigned'
  | 'in_progress'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 're_cleaning';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface Cleaner extends User {
  employeeId: string;
  employmentStatus: EmploymentStatus;
  hireDate: string;
  performanceScore: number;
  supervisorId?: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'department';
  parentId?: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  building: string;
  floor: string;
  department?: string;
  status: RoomStatus;
  qrCode: string;
  locationId: string;
  deadline?: string;
}

export interface AttendanceRecord {
  id: string;
  cleanerId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  gpsCheckIn?: GpsCoordinates;
  gpsCheckOut?: GpsCoordinates;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  cleanerId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

export interface CleaningTask {
  id: string;
  roomId: string;
  cleanerId: string;
  assignmentId: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  rejectionReason?: string;
  supervisorRating?: number;
  gpsStart?: GpsCoordinates;
  gpsComplete?: GpsCoordinates;
  qrVerified: boolean;
  estimatedDurationMinutes: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalCleaners: number;
  cleanersPresent: number;
  cleanersAbsent: number;
  totalRoomsAssigned: number;
  roomsCompleted: number;
  roomsPending: number;
  roomsOverdue: number;
  tasksAwaitingVerification: number;
  completionRate: number;
  averageCleaningTime: number;
}

export interface AdminDashboardOverview extends DashboardStats {
  supervisorCount: number;
  roomCount: number;
  activeUsers: number;
}

export interface PerformanceReport {
  cleanerId: string;
  cleanerName: string;
  roomsCleaned: number;
  completionRate: number;
  averageTimeMinutes: number;
  attendanceRate: number;
  performanceScore: number;
}
