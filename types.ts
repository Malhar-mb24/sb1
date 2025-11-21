export enum UserRole {
  PATIENT = 'PATIENT',
  MITRA = 'MITRA',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export enum TriageLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export enum ConsultationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  licenseId?: string; // For Doctors
  location?: string; // For Mitras
}

export interface Vitals {
  bp: string;
  spo2: number;
  temp: number;
  pulse: number;
  glucose: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  phone: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'pdf' | 'audio';
  url: string;
  name: string;
  timestamp: Date;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  mitraId?: string;
  
  // Clinical Data
  vitals: Vitals;
  chiefComplaint: string; // Audio transcript or text
  symptoms: string; // Brief summary
  
  // Attachments
  attachments: MediaAttachment[];
  
  // Status
  triage: TriageLevel;
  status: ConsultationStatus;
  createdAt: Date;
  
  // Doctor Output
  clinicalNotes?: string;
  diagnosis?: string; // ICD-10 Code
  prescription?: PrescriptionItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  threshold: number; // Low stock warning level
  location: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    age: number;
    bloodGroup: string;
    avatarUrl: string;
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' }
];