import { User, UserRole, Consultation, ConsultationStatus, TriageLevel, Patient, InventoryItem } from '../types';

// --- MOCK DATABASE ---

const USERS: Record<string, User> = {
  'p1': { id: 'p1', name: 'Rajesh Kumar', role: UserRole.PATIENT },
  'm1': { id: 'm1', name: 'Suman Singh', role: UserRole.MITRA, location: 'Sector 4, Bihar' },
  'd1': { id: 'd1', name: 'Dr. Sarah Khan', role: UserRole.DOCTOR, licenseId: 'MED-2024-889' },
  'a1': { id: 'a1', name: 'System Admin', role: UserRole.ADMIN },
};

const PATIENTS: Patient[] = [
  { id: 'pat-101', name: 'Ramesh Gupta', age: 54, gender: 'Male', abhaId: '91-1234-5678', phone: '9876543210' },
  { id: 'pat-102', name: 'Sunita Devi', age: 42, gender: 'Female', abhaId: '91-8765-4321', phone: '9123456789' },
];

const INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Paracetamol 500mg', stock: 450, unit: 'Tablets', threshold: 100, location: 'Kiosk-04' },
  { id: 'inv-2', name: 'Amoxicillin 500mg', stock: 42, unit: 'Capsules', threshold: 50, location: 'Kiosk-04' },
  { id: 'inv-3', name: 'Metformin 500mg', stock: 120, unit: 'Tablets', threshold: 100, location: 'Kiosk-04' },
  { id: 'inv-4', name: 'ORS Sachets', stock: 800, unit: 'Packets', threshold: 200, location: 'Kiosk-04' },
];

let CONSULTATIONS: Consultation[] = [
  {
    id: 'c-1',
    patientId: 'pat-101',
    patientName: 'Ramesh Gupta',
    mitraId: 'm1',
    status: ConsultationStatus.PENDING,
    triage: TriageLevel.RED,
    vitals: { bp: '160/95', spo2: 92, pulse: 105, temp: 99.1, glucose: 140 },
    symptoms: 'Severe chest pain radiating to left arm.',
    chiefComplaint: 'Patient reports sudden onset chest pain after physical exertion. History of hypertension.',
    attachments: [
       { id: 'att-1', type: 'image', name: 'ecg_strip.jpg', url: 'https://picsum.photos/200/300', timestamp: new Date() }
    ],
    createdAt: new Date()
  },
  {
    id: 'c-2',
    patientId: 'pat-102',
    patientName: 'Sunita Devi',
    mitraId: 'm1',
    status: ConsultationStatus.PENDING,
    triage: TriageLevel.GREEN,
    vitals: { bp: '120/80', spo2: 99, pulse: 72, temp: 98.4, glucose: 90 },
    symptoms: 'Skin rash on forearm.',
    chiefComplaint: 'Itching sensation on left forearm for 2 days. No fever.',
    attachments: [
        { id: 'att-2', type: 'image', name: 'rash_photo.jpg', url: 'https://picsum.photos/200/301', timestamp: new Date() }
    ],
    createdAt: new Date()
  }
];

// --- API SERVICE LAYER ---

export const api = {
  auth: {
    login: async (role: UserRole): Promise<User> => {
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = Object.values(USERS).find(u => u.role === role);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  patient: {
    search: async (query: string): Promise<Patient | null> => {
      return PATIENTS.find(p => p.phone.includes(query) || p.abhaId.includes(query)) || null;
    },
    register: async (data: Omit<Patient, 'id'>): Promise<Patient> => {
      const newPatient = { ...data, id: `pat-${Date.now()}` };
      PATIENTS.push(newPatient);
      return newPatient;
    },
    getHistory: async (patientId: string): Promise<Consultation[]> => {
        // In a real app, we'd filter by user ID logic
        return CONSULTATIONS.filter(c => c.status === ConsultationStatus.COMPLETED);
    }
  },

  consultation: {
    create: async (data: Omit<Consultation, 'id' | 'status' | 'createdAt'>): Promise<Consultation> => {
      const newConsultation: Consultation = {
        ...data,
        id: `c-${Date.now()}`,
        status: ConsultationStatus.PENDING,
        createdAt: new Date()
      };
      CONSULTATIONS.push(newConsultation);
      return newConsultation;
    },
    getAll: async (): Promise<Consultation[]> => {
      return [...CONSULTATIONS];
    },
    getQueue: async (): Promise<Consultation[]> => {
        return CONSULTATIONS.filter(c => c.status !== ConsultationStatus.COMPLETED);
    },
    updateStatus: async (id: string, status: ConsultationStatus): Promise<void> => {
      const idx = CONSULTATIONS.findIndex(c => c.id === id);
      if (idx !== -1) CONSULTATIONS[idx].status = status;
    },
    complete: async (id: string, diagnosis: string, notes: string, rx: any[]): Promise<void> => {
        const idx = CONSULTATIONS.findIndex(c => c.id === id);
        if (idx !== -1) {
            CONSULTATIONS[idx].status = ConsultationStatus.COMPLETED;
            CONSULTATIONS[idx].diagnosis = diagnosis;
            CONSULTATIONS[idx].clinicalNotes = notes;
            CONSULTATIONS[idx].prescription = rx;
        }
    }
  },
  
  inventory: {
      getAll: async (): Promise<InventoryItem[]> => {
          return [...INVENTORY];
      },
      updateStock: async (id: string, count: number): Promise<void> => {
          const item = INVENTORY.find(i => i.id === id);
          if(item) item.stock = count;
      }
  }
};