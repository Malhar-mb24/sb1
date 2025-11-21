import React, { useState, useEffect } from 'react';
import { User, Vitals, Patient, TriageLevel, Department } from '../types';
import { api } from '../services/api';
import { 
  Search, UserPlus, Upload, Mic, Camera, Save, ChevronRight, 
  ChevronLeft, FileText, Stethoscope, LayoutGrid, MapPin, 
  Box, Activity, Wifi, Battery, Thermometer, AlertTriangle,
  CheckCircle, Share2, Map as MapIcon, Pill, Plus
} from 'lucide-react';

interface Props {
  user: User;
}

const MitraView: React.FC<Props> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'DASHBOARD' | 'INTAKE' | 'KIT' | 'RESOURCES'>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  
  // Intake State
  const [step, setStep] = useState(1);
  const [vitals, setVitals] = useState<Vitals>({ bp: '', spo2: 0, temp: 0, pulse: 0, glucose: 0 });
  const [attachments, setAttachments] = useState<{name: string, type: 'image' | 'pdf'}[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [recommendedDept, setRecommendedDept] = useState<Department>(Department.GENERAL);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // --- HELPER: SIMULATE VOICE FILL ---
  const simulateVoiceVitals = () => {
      setIsRecording(true);
      setTimeout(() => {
          setVitals({ bp: '130/85', spo2: 97, temp: 99.2, pulse: 88, glucose: 145 });
          setIsRecording(false);
          alert("Vitals auto-filled from voice dictation.");
      }, 2000);
  };

  // --- HELPER: INTELLIGENT ROUTING ---
  const runAiTriage = () => {
      setAnalyzing(true);
      setTimeout(() => {
          // Mock Logic for USP - The Bridge
          const text = chiefComplaint.toLowerCase();
          let dept = Department.GENERAL;
          let summary = `Patient presents with ${chiefComplaint}. Vitals indicate `;

          if (text.includes('bone') || text.includes('pain') || text.includes('knee') || text.includes('fracture')) {
              dept = Department.ORTHOPEDICS;
              summary += "possible musculoskeletal issue. ";
          } else if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
              dept = Department.DERMATOLOGY;
              summary += "dermatological concern. ";
          } else if (text.includes('heart') || text.includes('chest')) {
              dept = Department.CARDIOLOGY;
              summary += "cardiac symptoms. Immediate attention required. ";
          }

          if (vitals.temp > 100) summary += "Patient is febrile. ";
          if (parseInt(vitals.bp.split('/')[0]) > 140) summary += "Hypertensive urgency detected. ";

          setRecommendedDept(dept);
          setAiSummary(summary + "Sorted for specialist review.");
          setAnalyzing(false);
          setStep(4);
      }, 2000);
  };

  // --- ACTIONS ---
  const handleSearch = async () => {
    const res = await api.patient.search(searchTerm);
    if (res) setPatient(res);
    else alert("Patient not found. Please register.");
  };

  const handleRegister = async () => {
      const newP = await api.patient.register({
          name: 'New Patient', age: 30, gender: 'Female', abhaId: `91-${Math.floor(Math.random()*10000)}`, phone: searchTerm
      });
      setPatient(newP);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
      if(e.target.files && e.target.files[0]) {
          setAttachments([...attachments, { name: e.target.files[0].name, type }]);
      }
  };

  const submitConsultation = async () => {
    if(!patient) return;
    await api.consultation.create({
        patientId: patient.id,
        patientName: patient.name,
        mitraId: user.id,
        vitals,
        chiefComplaint,
        symptoms: aiSummary, // Sending the filtered summary
        triage: vitals.temp > 102 || parseInt(vitals.bp) > 160 ? TriageLevel.RED : TriageLevel.YELLOW,
        attachments: []
    });
    alert(`Case escalated to ${recommendedDept} Department.`);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setVitals({ bp: '', spo2: 0, temp: 0, pulse: 0, glucose: 0 });
    setAttachments([]);
    setChiefComplaint('');
    setPatient(null);
    setAiSummary('');
    setActiveSection('DASHBOARD');
  };

  // --- NAVIGATION ITEMS ---
  const NAV_ITEMS = [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutGrid },
      { id: 'INTAKE', label: 'Patient Intake', icon: UserPlus },
      { id: 'KIT', label: 'My Swasthya Kit', icon: Box },
      { id: 'RESOURCES', label: 'Resource Map', icon: MapIcon },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Field Unit</h2>
                <p className="text-sm font-bold text-slate-800 mt-1">{user.name}</p>
                <p className="text-xs text-slate-500">{user.location}</p>
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
                </button>
            ))}
            </nav>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Kit Status</span>
                    <span className="text-green-600 font-bold">Online</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-3/4"></div>
                </div>
            </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* DASHBOARD VIEW */}
        {activeSection === 'DASHBOARD' && (
            <div className="space-y-8 animate-fade-in">
                <header>
                    <h1 className="text-2xl font-bold text-slate-800">Field Operations</h1>
                    <p className="text-slate-500">Welcome back, Mitra. You have 3 pending follow-ups.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => setActiveSection('INTAKE')} className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform">
                        <UserPlus className="mb-4 opacity-80" size={32} />
                        <h3 className="text-lg font-bold">Start Consultation</h3>
                        <p className="text-teal-100 text-sm">Register & Triage Patients</p>
                    </div>
                    <div onClick={() => setActiveSection('KIT')} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <Box className="text-teal-600" size={32} />
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Low Stock</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Kit Inventory</h3>
                        <p className="text-slate-500 text-sm">Paracetamol below 20%</p>
                    </div>
                    <div onClick={() => setActiveSection('RESOURCES')} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-colors">
                        <MapIcon className="text-blue-600 mb-4" size={32} />
                        <h3 className="text-lg font-bold text-slate-800">Resource Map</h3>
                        <p className="text-slate-500 text-sm">Locate nearest dispensers</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Screenings</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-500 bg-slate-50 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Patient</th>
                                <th className="px-4 py-3">Issue</th>
                                <th className="px-4 py-3">Routed To</th>
                                <th className="px-4 py-3 rounded-r-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { name: 'Ramesh G.', issue: 'Chest Pain', route: 'Cardiology', status: 'Urgent' },
                                { name: 'Sunita D.', issue: 'Skin Rash', route: 'Dermatology', status: 'Pending' },
                                { name: 'Vikram S.', issue: 'Knee Pain', route: 'Orthopedics', status: 'Completed' }
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 font-bold text-slate-700">{row.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.issue}</td>
                                    <td className="px-4 py-3 text-teal-700 font-medium bg-teal-50 rounded-lg inline-block my-2">{row.route}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${row.status === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* MY SWASTHYA KIT VIEW */}
        {activeSection === 'KIT' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Box className="text-teal-600"/> My Swasthya Kit</h1>
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Run Diagnostics</button>
                </div>

                {/* Kit Status Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
                        <Wifi className="text-green-500" size={24}/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Connectivity</span>
                        <span className="font-bold text-slate-800">4G LTE Strong</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
                        <Battery className="text-teal-500" size={24}/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Battery</span>
                        <span className="font-bold text-slate-800">82% (6h left)</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
                        <Thermometer className="text-orange-500" size={24}/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Int. Temp</span>
                        <span className="font-bold text-slate-800">24°C (Normal)</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
                        <Activity className="text-blue-500" size={24}/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Devices</span>
                        <span className="font-bold text-slate-800">5/5 Active</span>
                    </div>
                </div>

                {/* Connected Devices List */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-700 mb-4">Connected Diagnostics Peripherals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Digital BP Monitor', status: 'Ready', id: 'BP-X200' },
                            { name: 'Pulse Oximeter', status: 'Active', id: 'OX-99' },
                            { name: 'Glucometer', status: 'Standby', id: 'GL-55' },
                            { name: 'Digital Stethoscope', status: 'Ready', id: 'ST-PRO' },
                            { name: 'ENT Otoscope Cam', status: 'Standby', id: 'CAM-01' },
                            { name: '12-Lead ECG', status: 'Connected', id: 'ECG-12' }
                        ].map(dev => (
                            <div key={dev.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{dev.name}</p>
                                        <p className="text-xs text-slate-500">ID: {dev.id}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded">{dev.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">Kit Medicine Inventory</h3>
                        <button className="text-xs text-teal-600 font-bold hover:underline">Request Restock</button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-3 rounded-l-lg">Medicine</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3 rounded-r-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Paracetamol 500mg', stock: 20, status: 'Low' },
                                { name: 'Amoxicillin 250mg', stock: 50, status: 'Good' },
                                { name: 'ORS Sachets', stock: 100, status: 'Good' },
                                { name: 'Cetirizine', stock: 5, status: 'Critical' }
                            ].map((med, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0">
                                    <td className="p-3 font-medium text-slate-700">{med.name}</td>
                                    <td className="p-3">{med.stock}</td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${med.status === 'Good' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {med.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* RESOURCE MAP VIEW */}
        {activeSection === 'RESOURCES' && (
            <div className="space-y-6 animate-fade-in h-full flex flex-col">
                <header className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><MapIcon className="text-teal-600"/> Network Resources</h1>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Filter: Dispensaries</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Filter: Kiosks</button>
                    </div>
                </header>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Map Placeholder */}
                    <div className="flex-1 bg-slate-200 rounded-2xl border border-slate-300 relative overflow-hidden flex items-center justify-center group">
                        <div className="absolute inset-0 bg-[url('https://i.imgur.com/4h71j0G.png')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                        <p className="relative z-10 bg-white/80 backdrop-blur px-6 py-3 rounded-xl font-bold text-slate-600 shadow-lg">Interactive Map Loading...</p>
                        
                        {/* Mock Pins */}
                        <div className="absolute top-1/4 left-1/4 group-hover:scale-110 transition-transform cursor-pointer">
                            <MapPin className="text-red-500 drop-shadow-md" size={32}/>
                            <span className="bg-white text-xs font-bold px-2 py-1 rounded shadow absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">Central Dispensary</span>
                        </div>
                        <div className="absolute bottom-1/3 right-1/3 group-hover:scale-110 transition-transform cursor-pointer">
                            <Box className="text-blue-600 drop-shadow-md" size={28}/>
                            <span className="bg-white text-xs font-bold px-2 py-1 rounded shadow absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">Kiosk #42</span>
                        </div>
                    </div>

                    {/* List View */}
                    <div className="w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto p-4">
                        <h3 className="font-bold text-slate-700 mb-4">Nearby Units</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Kiosk #42 - Market Square', type: 'Vending Machine', status: 'Online', dist: '0.5 km' },
                                { name: 'Sector 4 Dispensary', type: 'Pharmacy', status: 'Open', dist: '1.2 km' },
                                { name: 'Mobile Unit Alpha', type: 'Ambulance', status: 'On Call', dist: '3.5 km' },
                                { name: 'Kiosk #45 - Village Hall', type: 'Vending Machine', status: 'Maintenance', dist: '5.0 km' },
                            ].map((loc, i) => (
                                <div key={i} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 text-sm">{loc.name}</h4>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${loc.status === 'Maintenance' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{loc.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{loc.type} • {loc.dist}</p>
                                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 bg-slate-800 text-white text-xs py-1.5 rounded font-bold">View Inventory</button>
                                        <button className="flex-1 border border-slate-300 text-slate-600 text-xs py-1.5 rounded font-bold">Navigate</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* PATIENT INTAKE VIEW */}
        {activeSection === 'INTAKE' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Step 1: Search */}
                {!patient ? (
                    <div className="bg-white p-10 rounded-3xl shadow-lg border border-teal-100 text-center mt-10">
                        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Intake</h2>
                        <p className="text-slate-500 mb-8">Search for an existing patient or register a new one to begin.</p>
                        <div className="flex gap-3 max-w-lg mx-auto">
                            <input 
                                type="text" 
                                placeholder="Mobile Number or ABHA ID" 
                                className="flex-1 p-4 border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button onClick={handleSearch} className="bg-teal-600 text-white px-8 rounded-xl font-bold hover:bg-teal-700">Search</button>
                        </div>
                        <div className="mt-4">
                            <button onClick={handleRegister} className="text-teal-600 font-bold text-sm hover:underline">+ Register New Patient</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        {/* Progress Header */}
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">{patient.name[0]}</div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{patient.name}</h3>
                                    <p className="text-xs text-slate-500">Step {step} of 4</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-teal-600 scale-125' : s < step ? 'bg-teal-300' : 'bg-slate-300'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="p-8 min-h-[400px]">
                            
                            {/* STEP 1: VITALS */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-800">Record Vitals</h3>
                                        <button onClick={simulateVoiceVitals} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
                                            <Mic size={16}/> {isRecording ? 'Listening...' : 'Dictate Vitals'}
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Blood Pressure</label>
                                            <div className="flex items-center gap-2">
                                                <Activity className="text-slate-400" size={20}/>
                                                <input type="text" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} className="bg-transparent text-xl font-bold text-slate-800 w-full outline-none" placeholder="--/--" />
                                            </div>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SpO2 %</label>
                                            <div className="flex items-center gap-2">
                                                <Activity className="text-slate-400" size={20}/>
                                                <input type="number" value={vitals.spo2 || ''} onChange={e => setVitals({...vitals, spo2: +e.target.value})} className="bg-transparent text-xl font-bold text-slate-800 w-full outline-none" placeholder="--" />
                                            </div>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Temperature (°F)</label>
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="text-slate-400" size={20}/>
                                                <input type="number" value={vitals.temp || ''} onChange={e => setVitals({...vitals, temp: +e.target.value})} className="bg-transparent text-xl font-bold text-slate-800 w-full outline-none" placeholder="--" />
                                            </div>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Glucose (mg/dL)</label>
                                            <div className="flex items-center gap-2">
                                                <Activity className="text-slate-400" size={20}/>
                                                <input type="number" value={vitals.glucose || ''} onChange={e => setVitals({...vitals, glucose: +e.target.value})} className="bg-transparent text-xl font-bold text-slate-800 w-full outline-none" placeholder="--" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SYMPTOMS */}
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

                            {/* STEP 3: AI PREVIEW (THE BRIDGE) */}
                            {step === 3 && (
                                <div className="flex flex-col items-center justify-center h-full py-10 animate-fade-in">
                                    {!analyzing ? (
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Share2 size={40}/>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Generate Smart Summary</h3>
                                            <p className="text-slate-500 max-w-md mx-auto mb-8">Swasthya AI will analyze vitals and symptoms to route this case to the correct specialist.</p>
                                            <button onClick={runAiTriage} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg">
                                                Run AI Triage
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                                            <h3 className="font-bold text-slate-800 text-lg">Analyzing Clinical Data...</h3>
                                            <p className="text-slate-500">Filtering history & matching specialist</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: FINAL REVIEW & ROUTING */}
                            {step === 4 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                        <h3 className="text-purple-800 font-bold flex items-center gap-2 mb-2">
                                            <Share2 size={20}/> AI Clinical Brief (For Doctor)
                                        </h3>
                                        <p className="text-slate-700 leading-relaxed font-medium">{aiSummary}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suggested Department</label>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="text-teal-600" size={24}/>
                                                <select 
                                                    value={recommendedDept} 
                                                    onChange={(e) => setRecommendedDept(e.target.value as Department)}
                                                    className="font-bold text-lg text-slate-800 bg-transparent outline-none w-full"
                                                >
                                                    {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority Level</label>
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className={vitals.temp > 100 ? "text-red-500" : "text-yellow-500"} size={24}/>
                                                <span className="font-bold text-lg text-slate-800">
                                                    {vitals.temp > 100 || parseInt(vitals.bp) > 150 ? 'High Priority' : 'Standard'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between">
                            <button 
                                onClick={() => setStep(s => Math.max(1, s - 1))} 
                                className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2"
                                disabled={step === 1}
                            >
                                Back
                            </button>
                            
                            {step < 3 && (
                                <button onClick={() => setStep(s => s + 1)} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2">
                                    Next <ChevronRight size={16}/>
                                </button>
                            )}
                            
                            {step === 4 && (
                                <button onClick={submitConsultation} className="bg-teal-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-200">
                                    Transmit to Doctor <CheckCircle size={18}/>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default MitraView;