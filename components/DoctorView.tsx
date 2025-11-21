import React, { useState, useEffect } from 'react';
import { User, Consultation, ConsultationStatus, PrescriptionItem, Department } from '../types';
import { api } from '../services/api';
import { formatClinicalNotes } from '../services/geminiService';
import { 
  Mic, Video, FileText, CheckCircle, Pill, Clock, 
  Paperclip, Play, X, Box, Share2, ClipboardCheck, 
  Search, ChevronRight, Lock, Unlock, AlertTriangle,
  Users, Calendar, Activity, LayoutGrid
} from 'lucide-react';

interface Props {
  user: User;
}

// --- 1. QUEUE MANAGEMENT ---
const QueueList = ({ queue, onAttend }: { queue: Consultation[], onAttend: (c: Consultation) => void }) => (
    <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden h-full flex flex-col animate-in fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Patient Queue</h2>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">{queue.length} Waiting</span>
        </div>
        <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold text-sm sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-4">Priority</th>
                        <th className="p-4">Patient</th>
                        <th className="p-4">Complaint</th>
                        <th className="p-4">Wait Time</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.map(p => (
                        <tr key={p.id} className="border-b hover:bg-slate-50 transition">
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.triage === 'RED' ? 'bg-red-100 text-red-600' : p.triage === 'YELLOW' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                    {p.triage}
                                </span>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{p.patientName}</td>
                            <td className="p-4 text-slate-500 text-sm max-w-xs truncate">{p.symptoms}</td>
                            <td className="p-4 text-xs font-mono text-slate-500">12m</td>
                            <td className="p-4">
                                <button onClick={() => onAttend(p)} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 shadow-sm transition-colors">
                                    Attend
                                </button>
                            </td>
                        </tr>
                    ))}
                    {queue.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-400">
                                <CheckCircle className="mx-auto mb-2 opacity-50" size={32}/>
                                No patients waiting.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- 2. PATIENT REPORTS & TIMELINE ---
const PatientTimeline = () => (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input type="text" placeholder="Search Patient by Name or ABHA ID..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500" />
            </div>
            <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors">Search</button>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-teal-600" size={20}/> Medical History: Ramesh Gupta (54M)
            </h3>
            <div className="space-y-8 relative pl-4 border-l-2 border-slate-200 ml-4">
                {[
                    { date: 'Oct 24, 2024', type: 'Lab Report', title: 'HbA1c Analysis', doctor: 'Dr. Sarah Khan', status: 'Abnormal' },
                    { date: 'Sep 10, 2024', type: 'Consultation', title: 'General Checkup - Fever', doctor: 'Dr. Amit Verma', status: 'Resolved' },
                    { date: 'Aug 01, 2024', type: 'Imaging', title: 'Chest X-Ray PA View', doctor: 'Radiology Dept', status: 'Normal' },
                ].map((item, i) => (
                    <div key={i} className="relative group">
                        <div className="absolute -left-[25px] top-0 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-sm group-hover:scale-125 transition-transform"></div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition cursor-pointer hover:bg-teal-50/30">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.date}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'Abnormal' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.status}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                            <p className="text-sm text-slate-500 mb-4">{item.type} • Author: {item.doctor}</p>
                            <button className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:underline">View Details <ChevronRight size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- 3. CLINICAL NOTES & DIAGNOSTICS ---
const DiagnosticManager = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in slide-in-from-right-4 duration-300">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardCheck className="text-teal-600"/> Pending Lab Approvals</h3>
            <div className="space-y-3 overflow-y-auto flex-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-slate-700">Sample #LAB-{200+i}</span>
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-bold border border-orange-100">Review</span>
                            </div>
                            <p className="text-xs text-slate-500">Lipid Profile • Patient: Sunita Devi</p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-teal-600" size={20} />
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="text-blue-600"/> Diagnostic Timeline</h3>
             <div className="bg-slate-50 p-4 rounded-xl text-center border-2 border-dashed border-slate-200 flex-1 flex flex-col items-center justify-center">
                 <Activity className="text-slate-300 mb-2" size={48} />
                 <p className="text-slate-500 font-medium">Select a lab request to view tracking timeline</p>
             </div>
        </div>
    </div>
);

// --- 4. KIOSK & VENDING CONTROL ---
const KioskController = () => {
    const [dispensing, setDispensing] = useState<string | null>(null);
    
    const handleDispense = (slot: string) => {
        setDispensing(slot);
        setTimeout(() => {
            alert(`Successfully dispensed from Slot ${slot}`);
            setDispensing(null);
        }, 2000);
    }

    return (
        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Box size={32} className="text-teal-400"/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Sector-4 Remote Kiosk</h2>
                        <p className="text-slate-400 text-sm flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Unit ID: KIOSK-BR-04 • Signal: Strong</p>
                    </div>
                </div>
                <div className="flex gap-6 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">98°F</p>
                        <p className="text-xs text-slate-400">Storage Temp</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6">
                        <p className="text-2xl font-bold text-blue-400">ON</p>
                        <p className="text-xs text-slate-400">System Status</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-y-auto">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Box className="text-teal-600"/> Vending Machine Control Deck
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                        { slot: 'A1', name: 'Paracetamol 500mg', stock: 45 },
                        { slot: 'A2', name: 'Ibuprofen 400mg', stock: 12 },
                        { slot: 'B1', name: 'Amoxicillin 250mg', stock: 8 },
                        { slot: 'B2', name: 'Cetirizine 10mg', stock: 100 },
                        { slot: 'C1', name: 'ORS Sachet', stock: 200 },
                        { slot: 'C2', name: 'Antacid Gel', stock: 5 },
                    ].map((item) => (
                        <div key={item.slot} className="border border-slate-200 rounded-xl p-4 relative group hover:border-teal-400 transition bg-slate-50 hover:bg-white hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-slate-200 text-slate-600 font-mono font-bold px-2 py-1 rounded text-xs">{item.slot}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {item.stock} left
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-4 h-10 leading-tight flex items-center">{item.name}</h4>
                            <button 
                                onClick={() => handleDispense(item.slot)}
                                disabled={!!dispensing}
                                className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {dispensing === item.slot ? 'Dispensing...' : 'Remote Dispense'}
                                {dispensing !== item.slot && (item.stock < 10 ? <Lock size={14}/> : <Unlock size={14}/>)}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- 5. POST TREATMENT PLANNING ---
const CarePlanner = () => (
    <div className="h-full flex gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="w-1/3 bg-white p-6 rounded-xl border border-slate-200 h-full flex flex-col shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-teal-600"/> Select Patient</h3>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="text" placeholder="Search active patients..." className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div className="space-y-2 overflow-y-auto flex-1">
                {['Ramesh Gupta', 'Sunita Devi', 'Vikram Singh'].map(n => (
                    <div key={n} className="p-3 hover:bg-teal-50 rounded-lg cursor-pointer flex items-center gap-3 group transition-colors">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs group-hover:bg-teal-200">{n[0]}</div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-teal-900">{n}</span>
                        <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-teal-500"/>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex-1 bg-white p-8 rounded-xl border border-slate-200 h-full overflow-y-auto shadow-sm">
            <h3 className="font-bold text-xl text-slate-800 mb-6">Post-Treatment Care Plan: Ramesh Gupta</h3>
            
            <div className="space-y-8 max-w-2xl">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Follow-up Schedule</label>
                    <div className="flex gap-3">
                         {['3 Days', '1 Week', '2 Weeks', '1 Month'].map((t, i) => (
                            <button key={t} className={`px-4 py-2 rounded-lg text-sm border transition-colors ${i===1 ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-md' : 'border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'}`}>
                                {t}
                            </button>
                         ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Lifestyle Modifications</label>
                    <div className="grid grid-cols-2 gap-3">
                         {['Low Salt Diet', 'Daily Walking (30m)', 'Sugar Monitoring', 'Avoid Alcohol', 'Physiotherapy', 'Water Intake > 3L'].map(t => (
                             <label key={t} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                 <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                                 <span className="text-sm text-slate-700">{t}</span>
                             </label>
                         ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Additional Clinical Instructions</label>
                    <textarea className="w-full border border-slate-200 rounded-xl p-4 h-32 focus:ring-2 focus:ring-teal-100 outline-none resize-none" placeholder="Enter specific instructions for the patient..."></textarea>
                </div>

                <button className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all active:scale-95">Save Care Plan</button>
            </div>
        </div>
    </div>
);

// --- 6. INTER-DEPARTMENT ESCALATION ---
const EscalationManager = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-6 border-b border-slate-100 bg-red-50">
            <h2 className="text-xl font-bold text-red-900 flex items-center gap-2"><Share2/> Inter-Department Escalation</h2>
            <p className="text-red-700/70 text-sm">Transfer patient care to specialized departments.</p>
        </div>
        <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Patient ID</label>
                    <input type="text" value="PAT-10928" disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 font-mono" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Status</label>
                    <div className="w-full bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-lg p-3 font-bold text-center">Under Observation</div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Target Department</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[Department.CARDIOLOGY, Department.NEUROLOGY, Department.ORTHOPEDICS, Department.DERMATOLOGY, Department.GYNECOLOGY, Department.GENERAL].map(dept => (
                        <button key={dept} className="p-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition text-left focus:ring-2 focus:ring-red-200 outline-none">
                            {dept}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Escalation</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-red-200 outline-none resize-none" placeholder="Describe the clinical reason for transfer..."></textarea>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 items-start border border-yellow-100">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-1" size={20} />
                <p className="text-sm text-yellow-800 leading-relaxed">Escalating will transfer full clinical responsibility to the receiving department. Current consultation will be closed immediately.</p>
            </div>

            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-md transition-all active:scale-95">
                Confirm & Escalate Case
            </button>
        </div>
    </div>
);

// --- MAIN DOCTOR VIEW ---

const DoctorView: React.FC<Props> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'QUEUE' | 'REPORTS' | 'CLINICAL' | 'KIOSK' | 'PLAN' | 'ESCALATION'>('QUEUE');
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [activeCase, setActiveCase] = useState<Consultation | null>(null);
  
  // Consultation State
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  const [newDrug, setNewDrug] = useState({ medicine: '', dosage: '', duration: '' });

  useEffect(() => {
      loadQueue();
      const interval = setInterval(loadQueue, 10000);
      return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
      const data = await api.consultation.getQueue();
      setQueue(data);
  };

  const startConsultation = async (c: Consultation) => {
      await api.consultation.updateStatus(c.id, ConsultationStatus.IN_PROGRESS);
      setActiveCase(c);
      setNotes('');
      setPrescription([]);
      setDiagnosis('');
  };

  // --- UTILITIES ---
  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Web Speech API not supported.");
        return;
    }
    if(isListening) {
        setIsListening(false);
    } else {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e: any) => {
            const text = e.results[0][0].transcript;
            setNotes(prev => prev + " " + text);
        };
        recognition.start();
    }
  };

  const handleAIFormat = async () => {
    if(!activeCase) return;
    setIsFormatting(true);
    const formatted = await formatClinicalNotes(notes, activeCase.vitals);
    setNotes(formatted);
    setIsFormatting(false);
  };

  const addMedicine = () => {
      if(newDrug.medicine) {
          setPrescription([...prescription, { ...newDrug }]);
          setNewDrug({ medicine: '', dosage: '', duration: '' });
      }
  };

  const finalizeConsultation = async () => {
      if(!activeCase) return;
      await api.consultation.complete(activeCase.id, diagnosis, notes, prescription);
      setActiveCase(null);
      loadQueue();
      alert("Consultation Completed & Prescription Sent.");
  };

  const NAV_ITEMS = [
      { id: 'QUEUE', label: 'Patient Queue', icon: Users },
      { id: 'REPORTS', label: 'Patient Reports', icon: Calendar },
      { id: 'CLINICAL', label: 'Clinical/Diagnostics', icon: ClipboardCheck },
      { id: 'KIOSK', label: 'Kiosk Control', icon: LayoutGrid },
      { id: 'PLAN', label: 'Care Planning', icon: FileText },
      { id: 'ESCALATION', label: 'Escalation', icon: Share2 },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50 overflow-hidden">
      
      {/* CONSULTATION OVERLAY MODE */}
      {activeCase ? (
        <div className="flex-1 flex flex-col h-full w-full bg-white z-50 absolute inset-0">
             {/* Top Bar */}
             <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="font-bold text-slate-800">{activeCase.patientName} <span className="text-slate-400 font-normal">| ID: {activeCase.id}</span></h2>
                </div>
                <div className="flex gap-2">
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Clock size={12} /> Time elapsed: 04:12
                    </div>
                    <button onClick={() => setActiveCase(null)} className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"><X size={20}/></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT COL: VIDEO & NOTES */}
                <div className="w-1/2 flex flex-col border-r border-slate-200 bg-slate-900">
                    <div className="flex-1 relative flex items-center justify-center bg-black">
                         {/* Placeholder for WebRTC Video */}
                         <div className="text-white text-center opacity-50">
                            <Video size={64} className="mx-auto mb-4" />
                            <p>Video Feed Connected (Sector 4 Kiosk)</p>
                         </div>
                         <div className="absolute top-4 right-4 w-32 h-24 bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden">
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs text-white">Self View</div>
                         </div>
                    </div>
                    
                    <div className="h-1/2 bg-white flex flex-col border-t border-slate-200">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileText size={14}/> Clinical Notes</h3>
                            <div className="flex gap-2">
                                <button onClick={toggleDictation} className={`p-1.5 rounded hover:bg-slate-200 ${isListening ? 'text-red-600 animate-pulse' : 'text-slate-600'}`} title="Dictate"><Mic size={16}/></button>
                                <button onClick={handleAIFormat} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded font-bold hover:bg-teal-200">{isFormatting ? 'AI Formatting...' : 'AI Auto-Format'}</button>
                            </div>
                        </div>
                        <textarea 
                            className="flex-1 p-4 resize-none focus:outline-none text-sm text-slate-700 font-mono"
                            placeholder="Type or dictate notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* RIGHT COL: PATIENT DATA */}
                <div className="w-1/2 overflow-y-auto bg-slate-50 p-6 space-y-6">
                    {/* Vitals Card */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Recorded Vitals</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                <div className="text-xs text-blue-400 font-bold">BP</div>
                                <div className="text-lg font-bold text-blue-700">{activeCase.vitals.bp}</div>
                            </div>
                            <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
                                <div className="text-xs text-teal-400 font-bold">SpO2</div>
                                <div className="text-lg font-bold text-teal-700">{activeCase.vitals.spo2}%</div>
                            </div>
                             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                                <div className="text-xs text-pink-400 font-bold">Pulse</div>
                                <div className="text-lg font-bold text-pink-700">{activeCase.vitals.pulse}</div>
                            </div>
                             <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                <div className="text-xs text-orange-400 font-bold">Glucose</div>
                                <div className="text-lg font-bold text-orange-700">{activeCase.vitals.glucose}</div>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                         <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Attachments ({activeCase.attachments.length})</h3>
                         <div className="grid grid-cols-3 gap-2">
                             {activeCase.attachments.map(a => (
                                 <div key={a.id} className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition">
                                     <Paperclip className="text-slate-400 mb-1" size={20} />
                                     <span className="text-[10px] text-slate-500 truncate w-full text-center px-1">{a.name}</span>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Prescription Pad */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-t-4 border-t-teal-600">
                         <h3 className="font-bold text-teal-900 mb-3 flex items-center gap-2"><Pill size={16}/> e-Prescription</h3>
                         
                         <div className="mb-3">
                             <label className="block text-xs font-bold text-slate-500 mb-1">Diagnosis (ICD-10)</label>
                             <select className="w-full border border-slate-200 rounded p-2 text-sm" onChange={(e) => setDiagnosis(e.target.value)} value={diagnosis}>
                                 <option value="">Select Diagnosis...</option>
                                 <option value="I10">I10 - Essential Hypertension</option>
                                 <option value="J06">J06 - Acute URI</option>
                                 <option value="E11">E11 - Type 2 Diabetes</option>
                             </select>
                         </div>

                         <div className="space-y-2 mb-4">
                             {prescription.map((p, i) => (
                                 <div key={i} className="flex justify-between bg-slate-50 p-2 rounded border border-slate-100 text-sm">
                                     <span className="font-bold">{p.medicine}</span>
                                     <span className="text-slate-600">{p.dosage} ({p.duration})</span>
                                 </div>
                             ))}
                         </div>

                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                            <input type="text" placeholder="Medicine Name" className="w-full p-2 border rounded mb-2 text-sm" value={newDrug.medicine} onChange={e => setNewDrug({...newDrug, medicine: e.target.value})}/>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Dosage (1-0-1)" className="w-1/2 p-2 border rounded text-sm" value={newDrug.dosage} onChange={e => setNewDrug({...newDrug, dosage: e.target.value})}/>
                                <input type="text" placeholder="Duration" className="w-1/2 p-2 border rounded text-sm" value={newDrug.duration} onChange={e => setNewDrug({...newDrug, duration: e.target.value})}/>
                            </div>
                            <button onClick={addMedicine} className="w-full mt-2 text-xs font-bold text-teal-600 uppercase hover:bg-teal-50 py-1 rounded">Add to List</button>
                         </div>

                         <button onClick={finalizeConsultation} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 flex justify-center items-center gap-2">
                             <CheckCircle size={18} /> Sign & Dispense
                         </button>
                    </div>

                </div>
            </div>
        </div>
      ) : (
        // DEFAULT DASHBOARD MODE
        <div className="flex w-full max-w-full mx-auto h-full">
            {/* SIDEBAR */}
            <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
                 <div className="p-6 border-b border-slate-100">
                     <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor's Console</h2>
                     <p className="text-sm font-bold text-slate-800 mt-1">{user.name}</p>
                 </div>
                 <nav className="p-4 space-y-2 flex-1">
                    {NAV_ITEMS.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm
                            ${activeSection === item.id 
                                ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                            {item.id === 'QUEUE' && queue.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{queue.length}</span>
                            )}
                        </button>
                    ))}
                 </nav>
                 <div className="p-4 border-t border-slate-100">
                     <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-3 border border-blue-100">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-xs font-bold text-blue-800">System Online</span>
                     </div>
                 </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-6 overflow-hidden bg-slate-50/50">
                {activeSection === 'QUEUE' && <QueueList queue={queue} onAttend={startConsultation} />}
                {activeSection === 'REPORTS' && <PatientTimeline />}
                {activeSection === 'CLINICAL' && <DiagnosticManager />}
                {activeSection === 'KIOSK' && <KioskController />}
                {activeSection === 'PLAN' && <CarePlanner />}
                {activeSection === 'ESCALATION' && <EscalationManager />}
            </div>
        </div>
      )}
    </div>
  );
};

export default DoctorView;