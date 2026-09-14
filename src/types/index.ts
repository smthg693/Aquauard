export type UserRole = 'Citizen' | 'Authority' | 'Field Officer' | 'Admin';

export type AccountStatus = 'active' | 'suspended' | 'pending_approval';

export type ComplaintSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus = 
  | 'Submitted' 
  | 'Acknowledged' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Closed';

export type OfficerStatus = 'available' | 'on_field' | 'off_duty';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Authority {
  id: string;
  name: string;
  jurisdictionArea: string;
  contactEmail?: string;
  contactInfo?: Record<string, any>;
  createdAt: string;
}

export interface Officer {
  id: string;
  userId: string;
  authorityId: string;
  area: string;
  status: OfficerStatus;
  currentWorkload: number;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintCode: string; // e.g. AQ-2026-001245
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  severity: ComplaintSeverity;
  latitude?: number;
  longitude?: number;
  address: string;
  city?: string;
  state?: string;
  pincode: string;
  status: ComplaintStatus;
  authorityId?: string;
  authorityName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  complaintId: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
}

export interface ComplaintStatusEvent {
  id: string;
  complaintId: string;
  fromStatus?: ComplaintStatus | null;
  toStatus?: ComplaintStatus;
  status?: ComplaintStatus;
  changedById?: string;
  changedByName?: string;
  changedRole?: string;
  reasonNotes?: string;
  note?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  complaintId: string;
  officerId: string;
  assignedBy: string;
  assignedAt: string;
  completedAt?: string;
}

export interface Note {
  id: string;
  complaintId: string;
  authorId: string;
  authorName?: string;
  authorRole?: UserRole;
  noteText: string;
  createdAt: string;
  isInternal: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}
