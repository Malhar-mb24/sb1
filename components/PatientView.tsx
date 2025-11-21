import React, { useState, useRef, useEffect } from 'react';
import { User, TriageLevel, Consultation } from '../types';
import { api } from '../services/api';
import { analyzeSymptoms } from '../services/geminiService';
import FamilyManager from './FamilyManager';
import SwasthyaScore from './SwasthyaScore';
import { 
  AlertCircle, Video, Send, Activity, Phone, History, 
  Calendar, Shield, CheckSquare, MapPin, Menu, X, 
  PlayCircle, FileText, Pill, ChevronRight, Users, HeartPulse,
  Mic
} from 'lucide-react';

interface Props {
  user: User;
}

const PatientView: React.FC<Props> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'history' | 'treatment' | 'education' | 'insurance' | 'services' | 'family' | 'score'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [isCallActive, setIsCallActive] = useState(false); // Video Call State
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; triage?: TriageLevel }[]>([
    { sender: 'ai', text: `Namaste, ${user.name}. I am your Swasthya assistant. Tell me your symptoms or ask a health question.` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      loadHistory();
  }, []);

  const loadHistory = async () => {
      const data = await api.patient.getHistory(user.id);
      setHistory(data);
  };

  const triggerSOS = () => {
      alert("EMERGENCY ALERT SENT TO NEAREST AMBULANCE & MITRA UNIT. HELP IS ON THE WAY.");
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsLoading(true);

    const result = await analyzeSymptoms(userMsg);

    const aiResponse = `[${result.triageLevel}] ${result.advice}. Suggested: ${result.recommendedSpecialist}`;
    setMessages(prev => [...prev, { sender: 'ai', text: aiResponse, triage: result.triageLevel as TriageLevel }]);
    setIsLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // --- ZEGO VIDEO CALL LOGIC ---
  const loadZegoScript = () => {
    return new Promise((resolve) => {
        if ((window as any).ZegoUIKitPrebuilt) {
            resolve((window as any).ZegoUIKitPrebuilt);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
        script.onload = () => {
            resolve((window as any).ZegoUIKitPrebuilt);
        };
        document.body.appendChild(script);
    });
  };

  const myMeeting = async (element: HTMLDivElement) => {
    if (!element) return;
    
    const ZegoUIKitPrebuilt = await loadZegoScript() as any;
    
    // Generate Kit Token
    const roomID = (Math.floor(Math.random() * 10000) + "");
    const userID = Math.floor(Math.random() * 10000) + "";
    const userName = user.name;
    const appID = 782258083;
    const serverSecret = "271e638a9ca347c0ebd6ee691c1728a0";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    // Start the call
    zp.joinRoom({
        container: element,
        sharedLinks: [{
            name: 'Personal link',
            url: window.location.protocol + '//' + window.location.host  + window.location.pathname + '?roomID=' + roomID,
        }],
        scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: "Auto",
        showLayoutButton: false,
        onLeaveRoom: () => setIsCallActive(false), // Close overlay when leaving
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'score', label: 'Swasthya Score', icon: HeartPulse },
    { id: 'history', label: 'Consultations', icon: History },
    { id: 'treatment', label: 'Post-Care Plan', icon: CheckSquare },
    { id: 'family', label: 'Family Members', icon: Users },
    { id: 'education', label: 'Health Videos', icon: Video },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'services', label: 'Health Services', icon: MapPin },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      
      {/* ZEGO VIDEO CALL OVERLAY */}
      {isCallActive && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-300">
             <div ref={myMeeting} style={{ width: '100vw', height: '100vh' }}></div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center lg:block">
          <div>
            <h2 className="font-bold text-lg text-teal-900">Patient Portal</h2>
            <p className="text-xs text-slate-500">ABHA: 91-8832-XXXX</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm
                ${activeSection === item.id 
                  ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 bg-slate-50 border-t border-slate-200">
           <div className="flex items-center gap-3 text-xs text-slate-500">
              <Shield size={14} className="text-green-600"/>
              <span>Secured by NDHM</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header inside Main */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                    {navItems.find(n => n.id === activeSection)?.label}
                </h1>
            </div>
            <button 
                onClick={triggerSOS} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 animate-pulse font-bold border-2 border-red-200 text-sm"
            >
                <Phone size={16} /> SOS ALERT
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
            
            {/* DASHBOARD VIEW */}
            {activeSection === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 space-y-6">
                         {/* Upcoming Appointment Card */}
                         <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                            <h3 className="font-bold text-lg mb-1 relative z-10">Next Appointment</h3>
                            <p className="opacity-90 text-sm mb-4 relative z-10">Follow-up with Dr. Sarah Khan</p>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="bg-white/20 px-3 py-2 rounded-lg text-center min-w-[60px]">
                                    <span className="block text-xs uppercase opacity-75">Today</span>
                                    <span className="block text-xl font-bold">4:30</span>
                                    <span className="block text-xs">PM</span>
                                </div>
                                <div className="flex-1 border-l border-white/20 pl-4">
                                    <p className="font-medium flex items-center gap-2"><Video size={16}/> Video Consultation</p>
                                    <p className="text-xs opacity-75 mt-1">Token #42 • Estimated Wait: 10 mins</p>
                                </div>
                                <button 
                                    onClick={() => setIsCallActive(true)}
                                    className="bg-white text-teal-800 px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-50 transition shadow-sm flex items-center gap-2"
                                >
                                    <Video size={16} /> Join Call
                                </button>
                            </div>
                         </div>

                         {/* Quick Actions Grid */}
                         <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setActiveSection('treatment')} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition text-left group">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Pill size={20}/>
                                </div>
                                <h4 className="font-bold text-slate-700">Medicines</h4>
                                <p className="text-xs text-slate-500">View today's schedule</p>
                            </button>
                            <button onClick={() => setActiveSection('history')} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition text-left group">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <FileText size={20}/>
                                </div>
                                <h4 className="font-bold text-slate-700">Reports</h4>
                                <p className="text-xs text-slate-500">Download Lab Results</p>
                            </button>
                         </div>
                    </div>

                    {/* AI Chat Window */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col h-[500px] lg:h-auto">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            AI Symptom Checker
                        </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                msg.sender === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'
                            }`}>
                                <p>{msg.text}</p>
                                {msg.triage && (
                                <span className={`text-xs font-bold mt-2 block uppercase ${msg.triage === 'RED' ? 'text-red-500' : msg.triage === 'YELLOW' ? 'text-yellow-600' : 'text-green-600'}`}>
                                    Priority: {msg.triage}
                                </span>
                                )}
                            </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-xs text-slate-400 p-2 italic">Analyzing symptoms...</div>}
                        <div ref={chatEndRef} />
                        </div>

                        <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type symptoms here..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
                        />
                        <button onClick={handleSend} className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition shadow-sm">
                            <Send size={16} />
                        </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SWASTHYA SCORE VIEW */}
            {activeSection === 'score' && <SwasthyaScore />}

            {/* HISTORY VIEW */}
            {activeSection === 'history' && (
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <History className="mx-auto text-slate-300 mb-3" size={48} />
                            <p className="text-slate-500 font-medium">No medical history found.</p>
                        </div>
                    ) : (
                        history.map(h => (
                            <div key={h.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-teal-300 transition group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <Calendar size={12}/> {new Date(h.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Completed</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">{h.diagnosis || 'General Consultation'}</h3>
                                        <p className="text-slate-500 text-sm mt-1 max-w-xl">"{h.chiefComplaint}"</p>
                                    </div>
                                    <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                                        <button className="flex-1 md:flex-none text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg">
                                            View Report
                                        </button>
                                        <button className="flex-1 md:flex-none text-sm font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                                            <Pill size={16}/> Rx
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* FAMILY VIEW */}
            {activeSection === 'family' && <FamilyManager />}

            {/* POST-TREATMENT PLAN */}
            {activeSection === 'treatment' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <CheckSquare className="text-indigo-600"/> Daily Care Checklist
                        </h2>
                        <div className="space-y-3">
                            {[
                                { time: 'Morning (8 AM)', task: 'Take Amoxicillin 500mg (After Food)', done: true },
                                { time: 'Afternoon (1 PM)', task: 'Check Blood Pressure', done: false },
                                { time: 'Night (9 PM)', task: 'Take Amoxicillin 500mg (After Food)', done: false },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer transition hover:shadow-md">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                        {item.done && <CheckSquare size={14} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.task}</p>
                                        <p className="text-xs text-slate-500">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                        <h3 className="font-bold text-slate-800 mb-4">Dietary & Lifestyle Advice</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                                <p>Avoid high sodium foods like pickles and papads to maintain BP.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                                <p>Drink at least 3 liters of water daily.</p>
                            </li>
                             <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                                <p>Light walking for 15 minutes in the evening is recommended.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* HEALTH EDUCATION */}
            {activeSection === 'education' && (
                <div>
                    <div className="relative mb-8">
                        <div className="bg-slate-900 text-white p-8 rounded-2xl overflow-hidden">
                            <div className="relative z-10 max-w-xl">
                                <span className="bg-teal-600 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Featured</span>
                                <h2 className="text-2xl font-bold mb-2">Understanding Hypertension</h2>
                                <p className="text-slate-300 mb-6 text-sm">Learn how to manage high blood pressure with simple diet changes and exercise.</p>
                                <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-slate-100">
                                    <PlayCircle size={18}/> Watch Now
                                </button>
                            </div>
                            <img src="https://picsum.photos/800/400?grayscale" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Video BG" />
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-800 mb-4">Recommended for You</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((v) => (
                            <div key={v} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group">
                                <div className="aspect-video bg-slate-100 relative">
                                    <img src={`https://picsum.photos/400/300?random=${v}`} className="w-full h-full object-cover" alt="Thumb" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                                        <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition duration-300" size={48} />
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-[10px] px-1.5 rounded">05:20</span>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">Daily Yoga for Diabetes Control</h4>
                                    <p className="text-xs text-slate-500">Swasthya Wellness • 12K views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* INSURANCE */}
            {activeSection === 'insurance' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-xs font-bold uppercase opacity-80 mb-1">Ayushman Bharat (PM-JAY)</p>
                                <h2 className="text-2xl font-bold tracking-widest">91-8832-XXXX-1234</h2>
                            </div>
                            <Shield size={32} className="opacity-80" />
                        </div>
                        <div className="mt-8 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-xs opacity-80">Beneficiary Name</p>
                                <p className="font-bold">{user.name}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold backdrop-blur-sm">ACTIVE</span>
                            </div>
                        </div>
                        {/* Decor */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Plan Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Total Coverage</span>
                                <span className="font-bold text-slate-800">₹5,00,000</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Used Amount</span>
                                <span className="font-bold text-slate-800">₹12,500</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-500 text-sm">Remaining Balance</span>
                                <span className="font-bold text-green-600">₹4,87,500</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEALTH SERVICES */}
            {activeSection === 'services' && (
                <div>
                     <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MapPin className="text-teal-600"/> Nearby Health Services
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                             { name: 'Jan Aushadhi Kendra #42', type: 'Pharmacy', dist: '0.5 km', status: 'Open' },
                             { name: 'City General Hospital', type: 'Clinic', dist: '2.1 km', status: 'Open 24/7' },
                             { name: 'PathKind Labs', type: 'Diagnostics', dist: '1.2 km', status: 'Closes 8 PM' },
                             { name: 'Red Cross Blood Bank', type: 'Blood Bank', dist: '3.5 km', status: 'Open 24/7' },
                         ].map((s, i) => (
                             <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center hover:border-teal-400 transition cursor-pointer">
                                 <div>
                                     <h3 className="font-bold text-slate-800">{s.name}</h3>
                                     <p className="text-sm text-slate-500">{s.type} • {s.dist}</p>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{s.status}</span>
                                     <button className="block mt-2 text-teal-600 text-xs font-bold flex items-center gap-1 justify-end hover:underline">
                                         Navigate <ChevronRight size={12} />
                                     </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
};

export default PatientView;