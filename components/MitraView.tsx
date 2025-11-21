import React, { useState } from 'react';
import { User, Vitals, Patient, TriageLevel } from '../types';
import { api } from '../services/api';
import { Search, UserPlus, Upload, Mic, Camera, Save, ChevronRight, ChevronLeft, FileText, Stethoscope } from 'lucide-react';

interface Props {
  user: User;
}

const MitraView: React.FC<Props> = ({ user }) => {
  const [view, setView] = useState<'DASHBOARD' | 'INTAKE'>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  
  // Intake State
  const [step, setStep] = useState(1);
  const [vitals, setVitals] = useState<Vitals>({ bp: '', spo2: 98, temp: 98.6, pulse: 72, glucose: 100 });
  const [attachments, setAttachments] = useState<{name: string, type: 'image' | 'pdf'}[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Search Logic
  const handleSearch = async () => {
    const res = await api.patient.search(searchTerm);
    if (res) {
      setPatient(res);
    } else {
      alert("Patient not found. Please register.");
    }
  };

  const handleRegister = async () => {
      // Mock registration for MVP
      const newP = await api.patient.register({
          name: 'New Patient', age: 30, gender: 'Female', abhaId: `91-${Math.floor(Math.random()*10000)}`, phone: searchTerm
      });
      setPatient(newP);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
      if(e.target.files && e.target.files[0]) {
          setAttachments([...attachments, { name: e.target.files[0].name, type }]);
      }
  }

  const submitConsultation = async () => {
    if(!patient) return;
    
    await api.consultation.create({
        patientId: patient.id,
        patientName: patient.name,
        mitraId: user.id,
        vitals,
        chiefComplaint,
        symptoms: chiefComplaint.substring(0, 50) + '...',
        triage: TriageLevel.YELLOW, // Logic would go here
        attachments: attachments.map((a, i) => ({
            id: `att-${i}`,
            type: a.type,
            url: 'https://via.placeholder.com/150', // Simulated upload URL
            name: a.name,
            timestamp: new Date()
        }))
    });

    alert("Consultation Submitted Successfully!");
    // Reset
    setStep(1);
    setVitals({ bp: '', spo2: 98, temp: 98.6, pulse: 72, glucose: 100 });
    setAttachments([]);
    setChiefComplaint('');
    setPatient(null);
    setView('DASHBOARD');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {view === 'DASHBOARD' && (
        <div className="space-y-8 animate-fade-in">
          <header className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Swasthya-Mitra Field Dashboard</h1>
                <p className="text-slate-500">Operator: {user.name} • {user.location}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-teal-600">STATUS: ONLINE</p>
                <p className="text-xs text-slate-400">Sync: Just now</p>
            </div>
          </header>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-teal-100 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Patient Lookup</h2>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Enter Mobile or ABHA ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button onClick={handleSearch} className="bg-teal-600 text-white px-6 rounded-lg hover:bg-teal-700 font-medium">Search</button>
            </div>

            {patient ? (
                 <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-left mb-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-teal-900">{patient.name}</h3>
                        <p className="text-sm text-teal-700">{patient.age} Y / {patient.gender} • {patient.phone}</p>
                    </div>
                    <button 
                        onClick={() => setView('INTAKE')}
                        className="bg-teal-700 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-teal-800"
                    >
                        Start Consultation
                    </button>
                </div>
            ) : (
                searchTerm.length > 5 && (
                    <div className="text-slate-500 text-sm">
                        No patient found? 
                        <button onClick={handleRegister} className="text-teal-600 font-bold ml-1 hover:underline flex items-center justify-center gap-1 mx-auto mt-2">
                            <UserPlus size={16} /> Quick Register
                        </button>
                    </div>
                )
            )}
          </div>
        </div>
      )}

      {view === 'INTAKE' && patient && (
        <div className="max-w-4xl mx-auto">
             <button onClick={() => setView('DASHBOARD')} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center text-sm">
                <ChevronLeft size={16} /> Cancel Consultation
             </button>

             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <span className={`flex items-center gap-2 text-sm font-bold ${step >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
                            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">1</div> Vitals
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className={`flex items-center gap-2 text-sm font-bold ${step >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
                             <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">2</div> Media
                        </span>
                         <span className="text-slate-300">/</span>
                        <span className={`flex items-center gap-2 text-sm font-bold ${step >= 3 ? 'text-teal-600' : 'text-slate-400'}`}>
                             <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">3</div> Review
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-500">ID: {patient.abhaId}</p>
                    </div>
                </div>

                <div className="p-8 min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Stethoscope className="text-teal-600"/> Step 1: Record Vitals</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Blood Pressure (mmHg)</label>
                                    <input type="text" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="120/80" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Blood Glucose (mg/dL)</label>
                                    <input type="number" value={vitals.glucose} onChange={e => setVitals({...vitals, glucose: Number(e.target.value)})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="100" />
                                </div>
                                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">SpO2 (%)</label>
                                        <input type="number" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: Number(e.target.value)})} className="w-full border p-2 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Pulse (BPM)</label>
                                        <input type="number" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: Number(e.target.value)})} className="w-full border p-2 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Temp (°F)</label>
                                        <input type="number" value={vitals.temp} onChange={e => setVitals({...vitals, temp: Number(e.target.value)})} className="w-full border p-2 rounded-lg" />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Camera className="text-teal-600"/> Step 2: Complaints & Media</h3>
                            
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Patient Audio Statement</label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsRecording(!isRecording)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                                    >
                                        <Mic size={18} /> {isRecording ? 'Recording... (Click to Stop)' : 'Record Audio (30s)'}
                                    </button>
                                    {/* Audio Visualizer Placeholder */}
                                    {isRecording && (
                                        <div className="flex gap-1 h-4 items-end">
                                            <div className="w-1 bg-red-400 h-2 animate-bounce"></div>
                                            <div className="w-1 bg-red-400 h-4 animate-bounce delay-75"></div>
                                            <div className="w-1 bg-red-400 h-3 animate-bounce delay-150"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Upload Images / Reports</label>
                                <div className="flex gap-4">
                                    <label className="cursor-pointer w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 hover:border-teal-400 transition">
                                        <Camera className="text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Add Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                    </label>
                                    <label className="cursor-pointer w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 hover:border-teal-400 transition">
                                        <FileText className="text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Add Report</span>
                                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf')} />
                                    </label>
                                </div>
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    {attachments.map((a, idx) => (
                                        <div key={idx} className="bg-teal-50 border border-teal-100 px-3 py-1 rounded-full text-xs text-teal-700 flex items-center gap-2">
                                            {a.type === 'image' ? <Camera size={12}/> : <FileText size={12}/>} {a.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Chief Complaint (Text Summary)</label>
                                <textarea 
                                    className="w-full border p-3 rounded-lg h-24 focus:ring-2 focus:ring-teal-500"
                                    placeholder="Describe symptoms..."
                                    value={chiefComplaint}
                                    onChange={(e) => setChiefComplaint(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    )}

                     {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Save className="text-teal-600"/> Step 3: Final Review</h3>
                             
                             <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2">
                                <p><strong>BP:</strong> {vitals.bp} | <strong>SpO2:</strong> {vitals.spo2}%</p>
                                <p><strong>Complaint:</strong> {chiefComplaint}</p>
                                <p><strong>Attachments:</strong> {attachments.length} files</p>
                             </div>

                             <p className="text-slate-500 text-sm">By submitting, you confirm that the vitals entered are accurate and the patient has consented to data collection.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
                    <button 
                        disabled={step === 1}
                        onClick={() => setStep(s => s-1)}
                        className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-white disabled:opacity-50"
                    >
                        Back
                    </button>
                    {step < 3 ? (
                        <button 
                            onClick={() => setStep(s => s+1)}
                            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2"
                        >
                            Next Step <ChevronRight size={16} />
                        </button>
                    ) : (
                         <button 
                            onClick={submitConsultation}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2"
                        >
                            Submit Consultation <Save size={16} />
                        </button>
                    )}
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default MitraView;