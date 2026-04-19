// shared/types/index.ts

export type ObjectIdStr = string;

// -- ENUMS --
export const VALID_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'] as const;
export type TaskStatus = typeof VALID_STATUSES[number];

export const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low', 'no_priority'] as const;
export type TaskPriority = typeof VALID_PRIORITIES[number];

export const HABIT_TYPES = ['dsa', 'project', 'learning', 'other'] as const;
export type HabitType = typeof HABIT_TYPES[number];

export const HABIT_RECURRENCE = ['daily', 'weekly'] as const;
export type HabitRecurrence = typeof HABIT_RECURRENCE[number];

export const INTERNSHIP_STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'] as const;
export type InternshipStatus = typeof INTERNSHIP_STATUSES[number];

export const CYCLE_STATUSES = ['upcoming', 'active', 'completed'] as const;
export type CycleStatus = typeof CYCLE_STATUSES[number];

export const ACTIVITY_ACTIONS = [
  'created', 'updated_status', 'updated_priority', 'moved_column',
  'renamed', 'assigned_cycle', 'unassigned_cycle', 'commented'
] as const;
export type ActivityAction = typeof ACTIVITY_ACTIONS[number];

// -- INTERFACES --

export interface IUser {
  _id: ObjectIdStr;
  name: string;
  email: string;
  githubUsername?: string;
  avatarUrl?: string;
  careerScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProject {
  _id: ObjectIdStr;
  userId: ObjectIdStr | IUser;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isPublic: boolean;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ILabel {
  name: string;
  color: string;
}

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ITask {
  _id: ObjectIdStr;
  projectId: ObjectIdStr | IProject;
  userId: ObjectIdStr | IUser;
  cycleId?: ObjectIdStr | ICycle;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: ILabel[];
  estimate: number;
  dueDate?: Date | string;
  subtasks: ISubtask[];
  orderIndex: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IComment {
  _id: ObjectIdStr;
  taskId: ObjectIdStr | ITask;
  userId: ObjectIdStr | IUser;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICycle {
  _id: ObjectIdStr;
  projectId: ObjectIdStr | IProject;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: CycleStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IActivityLog {
  _id: ObjectIdStr;
  entityType: 'Project' | 'Task' | 'Cycle';
  entityId: ObjectIdStr;
  userId: ObjectIdStr | IUser;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
}

// -- Career OS Interfaces --

export interface IHabit {
  _id: ObjectIdStr;
  userId: ObjectIdStr | IUser;
  title: string;
  type: HabitType;
  recurrence: HabitRecurrence;
  targetDaysPerWeek: number;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IHabitLog {
  _id: ObjectIdStr;
  habitId: ObjectIdStr | IHabit;
  userId: ObjectIdStr | IUser;
  logDate: Date | string;
  commitCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IStatusHistory {
  status: InternshipStatus;
  changedAt: Date | string;
}

export interface IInternshipApplication {
  _id: ObjectIdStr;
  userId: ObjectIdStr | IUser;
  companyName: string;
  role: string;
  status: InternshipStatus;
  applicationDate: Date | string;
  url?: string;
  notes?: string;
  statusHistory: IStatusHistory[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IFocusSession {
  _id: ObjectIdStr;
  userId: ObjectIdStr | IUser;
  habitId?: ObjectIdStr | IHabit;
  duration: number; // minutes
  startTime: Date | string;
  endTime?: Date | string;
  sessionDate: Date | string;
  completed: boolean;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
