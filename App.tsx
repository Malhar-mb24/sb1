import React, { useState } from 'react';
import { User, UserRole } from './types';
import { api } from './services/api';
import PatientView from './components/PatientView';
import MitraView from './components/MitraView';
import DoctorView from './components/DoctorView';
import AdminView from './components/AdminView';
import { Stethoscope, LayoutGrid, Users, Activity, LogOut, ShieldCheck } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    try {
        const loggedInUser = await api.auth.login(role);
        setUser(loggedInUser);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-teal-600 rounded-b-[50px] shadow-lg"></div>
        
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full text-center border border-teal-100 relative z-10 flex flex-col md:flex-row gap-8">
          
          <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-8 pb-8 md:pb-0">
             <div className="w-24 h-24 bg-teal-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform rotate-3">
                <Stethoscope className="text-white" size={48} />
             </div>
             <h1 className="text-3xl font-bold text-slate-800 mb-2">SwasthyaBhandhu</h1>
             <p className="text-slate-500 mb-4">Bridging rural healthcare with AI & Operations.</p>
             <div className="flex gap-2 text-xs font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-full">
                <ShieldCheck size={14}/> HIPAA / DISHA Compliant
             </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-700 mb-6 text-left">Select Portal Access</h2>
            <div className="space-y-3">
                {[
                    { role: UserRole.PATIENT, label: 'Patient Portal', icon: Users, color: 'blue', desc: 'Self-care & SOS' },
                    { role: UserRole.MITRA, label: 'Swasthya-Mitra', icon: LayoutGrid, color: 'orange', desc: 'Field Unit & Intake' },
                    { role: UserRole.DOCTOR, label: 'Doctor Console', icon: Stethoscope, color: 'purple', desc: 'Diagnosis & Rx' },
                    { role: UserRole.ADMIN, label: 'Admin Dashboard', icon: Activity, color: 'slate', desc: 'System Analytics' },
                ].map((opt) => (
                    <button 
                        key={opt.role}
                        onClick={() => handleLogin(opt.role)} 
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border border-slate-200 hover:border-${opt.color}-500 hover:bg-${opt.color}-50 transition group flex items-center gap-4 text-left ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`bg-${opt.color}-100 p-3 rounded-lg text-${opt.color}-600 group-hover:scale-110 transition`}>
                            <opt.icon size={20}/>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-800">{opt.label}</span>
                            <span className="text-xs text-slate-500">{opt.desc}</span>
                        </div>
                    </button>
                ))}
            </div>
            {loading && <p className="text-center text-teal-600 font-bold mt-4 text-sm animate-pulse">Authenticating secure session...</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-850 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Stethoscope size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden md:inline">SwasthyaBhandhu</span>
              <span className="bg-slate-700 text-xs px-2 py-1 rounded ml-2 uppercase tracking-wider font-mono">{user.role}</span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-slate-400">ID: {user.id}</p>
                </div>
                <button 
                    onClick={() => setUser(null)}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-red-600 px-4 py-2 rounded-lg transition text-white"
                >
                    <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main View */}
      <main>
        {user.role === UserRole.PATIENT && <PatientView user={user} />}
        {user.role === UserRole.MITRA && <MitraView user={user} />}
        {user.role === UserRole.DOCTOR && <DoctorView user={user} />}
        {user.role === UserRole.ADMIN && <AdminView />}
      </main>
    </div>
  );
}

export default App;