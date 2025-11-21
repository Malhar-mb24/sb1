import React, { useState, useEffect } from 'react';
import { User, Consultation, ConsultationStatus, TriageLevel, PrescriptionItem } from '../types';
import { api } from '../services/api';
import { formatClinicalNotes } from '../services/geminiService';
import { Mic, Video, FileText, CheckCircle, Activity, Pill, Clock, Paperclip, Play, Pause, X } from 'lucide-react';

interface Props {
  user: User;
}

const DoctorView: React.FC<Props> = ({ user }) => {
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [activeCase, setActiveCase] = useState<Consultation | null>(null);
  
  // Consultation State
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  
  // Modal State for Rx
  const [newDrug, setNewDrug] = useState({ medicine: '', dosage: '', duration: '' });

  useEffect(() => {
      loadQueue();
      const interval = setInterval(loadQueue, 10000); // Poll every 10s
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

  // AI-TODO: Replace with generic SpeechRecognition or Whisper API integration
  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Web Speech API not supported. Use Chrome.");
        return;
    }
    if(isListening) {
        setIsListening(false);
        // Stop logic handled by browser usually
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
          // AI-TODO: checkDrugInteractions(prescription, newDrug)
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

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR: QUEUE */}
      {!activeCase && (
        <div className="w-full p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Patient Queue</h1>
            <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
                        <tr>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Complaint</th>
                            <th className="p-4">Status</th>
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
                                <td className="p-4 text-xs uppercase font-bold text-slate-500">{p.status.replace('_', ' ')}</td>
                                <td className="p-4">
                                    <button onClick={() => startConsultation(p)} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 shadow-sm">
                                        Attend
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {queue.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">No patients waiting. Good job!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* CONSULTATION ROOM (SPLIT SCREEN) */}
      {activeCase && (
        <div className="flex-1 flex flex-col h-full">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="font-bold text-slate-800">{activeCase.patientName} <span className="text-slate-400 font-normal">| ID: {activeCase.id}</span></h2>
                </div>
                <div className="flex gap-2">
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Clock size={12} /> Time elapsed: 04:12
                    </div>
                    <button onClick={() => setActiveCase(null)} className="text-slate-500 hover:text-slate-800"><X size={20}/></button>
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

                    {/* Audio / Complaint */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                         <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Chief Complaint</h3>
                         <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 mb-2">
                            <button className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-slate-700"><Play size={12}/></button>
                            <div className="h-1 bg-slate-300 flex-1 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-slate-500"></div>
                            </div>
                            <span className="text-xs font-mono text-slate-500">00:12 / 00:45</span>
                         </div>
                         <p className="text-sm text-slate-600 italic">"{activeCase.chiefComplaint}"</p>
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
      )}
    </div>
  );
};

export default DoctorView;