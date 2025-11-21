import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../services/api';
import { InventoryItem, UserRole } from '../types';
import { 
  LayoutDashboard, Users, Stethoscope, UserCog, Wallet, 
  Activity, TrendingUp, AlertTriangle, Search, Filter, 
  MoreVertical, CheckCircle, XCircle, MapPin, FileText, 
  Shield, Zap, Package, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// --- MOCK DATA ---
const WEEKLY_STATS = [
  { name: 'Mon', Consultations: 40, Critical: 24, Revenue: 12000 },
  { name: 'Tue', Consultations: 30, Critical: 13, Revenue: 9500 },
  { name: 'Wed', Consultations: 20, Critical: 5, Revenue: 7000 },
  { name: 'Thu', Consultations: 27, Critical: 39, Revenue: 11000 },
  { name: 'Fri', Consultations: 18, Critical: 48, Revenue: 8500 },
  { name: 'Sat', Consultations: 23, Critical: 38, Revenue: 10500 },
  { name: 'Sun', Consultations: 34, Critical: 43, Revenue: 14000 },
];

const DISEASE_DATA = [
  { name: 'Viral Fever', value: 400 },
  { name: 'Hypertension', value: 300 },
  { name: 'Diabetes', value: 300 },
  { name: 'Dermatitis', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const STAFF_DATA = [
    { id: 1, name: 'Dr. Sarah Khan', role: 'Doctor', dept: 'Cardiology', status: 'Online', patients: 12, rating: 4.8 },
    { id: 2, name: 'Dr. Amit Verma', role: 'Doctor', dept: 'General', status: 'Busy', patients: 8, rating: 4.5 },
    { id: 3, name: 'Suman Singh', role: 'Mitra', dept: 'Field Unit 4', status: 'Online', patients: 24, rating: 4.9 },
    { id: 4, name: 'Rajesh Koothrappali', role: 'Mitra', dept: 'Field Unit 2', status: 'Offline', patients: 0, rating: 4.2 },
];

const TRANSACTIONS = [
    { id: 'TXN-9921', type: 'Consultation Fee', amount: 500, status: 'Success', date: 'Today, 10:42 AM' },
    { id: 'TXN-9922', type: 'Medicine Dispense', amount: 120, status: 'Success', date: 'Today, 10:45 AM' },
    { id: 'TXN-9923', type: 'Lab Test', amount: 850, status: 'Pending', date: 'Today, 11:00 AM' },
];

const AdminView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'WORKFORCE' | 'PATIENTS' | 'FINANCE' | 'INVENTORY' | 'ANALYTICS'>('OVERVIEW');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
      const loadData = async () => {
          const inv = await api.inventory.getAll();
          setInventory(inv);
      }
      loadData();
  }, []);

  const NAV_ITEMS = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
      { id: 'WORKFORCE', label: 'Workforce Mgmt', icon: UserCog },
      { id: 'PATIENTS', label: 'Patient Index', icon: Users },
      { id: 'FINANCE', label: 'Finance & Billing', icon: Wallet },
      { id: 'INVENTORY', label: 'Supply Chain', icon: Package },
      { id: 'ANALYTICS', label: 'AI Analytics', icon: Activity },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
        {/* SIDEBAR */}
        <div className="w-64 bg-slate-900 text-white h-full flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xs font-bold text-teal-400 uppercase tracking-wider">System Admin</h2>
                <p className="text-sm font-bold text-white mt-1">Super Admin Console</p>
            </div>
            <nav className="p-4 space-y-2 flex-1">
                {NAV_ITEMS.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveSection(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm
                        ${activeSection === item.id 
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-300">Server Status</p>
                        <p className="text-[10px] text-slate-500">Latency: 24ms</p>
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {/* --- OVERVIEW DASHBOARD --- */}
            {activeSection === 'OVERVIEW' && (
                <div className="space-y-8 animate-in fade-in">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
                            <p className="text-slate-500">Real-time metrics across the Swasthya network.</p>
                        </div>
                        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Shield size={16}/> Security Audit
                        </button>
                    </header>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users size={24}/></div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><ArrowUpRight size={12}/> +12%</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">1,284</p>
                            <p className="text-sm text-slate-500">Total Patients</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><Stethoscope size={24}/></div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">Active</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">42</p>
                            <p className="text-sm text-slate-500">Doctors Online</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Activity size={24}/></div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><ArrowUpRight size={12}/> +5%</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">856</p>
                            <p className="text-sm text-slate-500">Consultations (Week)</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Wallet size={24}/></div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">Daily</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">₹42.5k</p>
                            <p className="text-sm text-slate-500">Revenue Today</p>
                        </div>
                    </div>

                    {/* Main Charts */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Consultation & Revenue Trends</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={WEEKLY_STATS}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="Revenue" stroke="#0d9488" fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Disease Distribution</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={DISEASE_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {DISEASE_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- WORKFORCE MANAGEMENT --- */}
            {activeSection === 'WORKFORCE' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Workforce Management</h1>
                            <p className="text-slate-500">Manage Doctors and Swasthya Mitras access and assignments.</p>
                        </div>
                        <button className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2">
                            <Users size={18}/> Add New Staff
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input type="text" placeholder="Search staff..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500"/>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Filter size={16}/> Filter
                            </button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-4">Staff Name</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Department / Zone</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Active Cases</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {STAFF_DATA.map(staff => (
                                    <tr key={staff.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${staff.role === 'Doctor' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                                {staff.name[0]}
                                            </div>
                                            {staff.name}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${staff.role === 'Doctor' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">{staff.dept}</td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${staff.status === 'Online' ? 'text-green-600' : staff.status === 'Busy' ? 'text-orange-500' : 'text-slate-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${staff.status === 'Online' ? 'bg-green-500' : staff.status === 'Busy' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-700">{staff.patients}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- FINANCE --- */}
            {activeSection === 'FINANCE' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold">Total Revenue</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">₹12.4L</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full text-green-600"><Wallet size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold">Pending Payouts</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">₹85k</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-full text-orange-600"><Clock size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold">Avg Transaction</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">₹450</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600"><TrendingUp size={24}/></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Recent Transactions</h3>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Transaction ID</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 rounded-r-lg text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {TRANSACTIONS.map(txn => (
                                    <tr key={txn.id}>
                                        <td className="p-3 font-mono font-bold text-slate-600">{txn.id}</td>
                                        <td className="p-3 text-slate-800">{txn.type}</td>
                                        <td className="p-3 text-slate-500">{txn.date}</td>
                                        <td className="p-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${txn.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-800">₹{txn.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- AI ANALYTICS --- */}
            {activeSection === 'ANALYTICS' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-indigo-900 text-white p-8 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Activity className="text-teal-400"/> Predictive Health Intelligence</h2>
                            <p className="text-indigo-200 max-w-xl">Our AI models have detected a potential <strong>Viral Fever cluster</strong> forming in Sector 4 based on recent Swasthya Mitra inputs. Recommendation: Increase paracetamol stock in Kiosk #42.</p>
                            <button className="mt-6 bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg">
                                Deploy Resources
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Resource Optimization AI</h3>
                            <p className="text-sm text-slate-500 mb-4">Suggested reallocation of Field Mitras based on predicted demand.</p>
                            <div className="space-y-3">
                                {[
                                    { zone: 'Zone A', current: 2, suggested: 4, delta: '+2' },
                                    { zone: 'Zone B', current: 5, suggested: 3, delta: '-2' },
                                    { zone: 'Zone C', current: 3, suggested: 3, delta: '0' },
                                ].map((z, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="font-bold text-slate-700">{z.zone}</span>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-slate-500">Curr: {z.current}</span>
                                            <span className="text-teal-600 font-bold">Sugg: {z.suggested}</span>
                                            <span className={`font-bold ${z.delta.includes('+') ? 'text-green-600' : z.delta.includes('-') ? 'text-red-500' : 'text-slate-400'}`}>{z.delta}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Risk Stratification</h3>
                            <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <p>Population Risk Heatmap (Visualization Placeholder)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- INVENTORY (Enhanced Existing) --- */}
            {activeSection === 'INVENTORY' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-slate-700 text-lg">Supply Chain Control Tower</h2>
                        <button className="text-teal-600 text-sm font-bold hover:underline">+ Add Inventory</button>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-3">Medicine</th>
                                <th className="p-3">Location</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Burn Rate</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-slate-50 transition">
                                    <td className="p-3 font-bold text-slate-800">{row.name}</td>
                                    <td className="p-3 text-slate-500">{row.location}</td>
                                    <td className="p-3 font-mono">{row.stock} {row.unit}</td>
                                    <td className="p-3 text-slate-500">12/day</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            row.stock <= row.threshold ? 'bg-red-100 text-red-600' :
                                            row.stock <= row.threshold * 1.5 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {row.stock <= row.threshold ? 'Critical Low' : 'Healthy'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- PATIENTS (New) --- */}
            {activeSection === 'PATIENTS' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
                    <h2 className="font-bold text-slate-700 text-lg mb-6">Master Patient Index</h2>
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users size={48} className="mx-auto mb-4 opacity-50"/>
                        <p>Secure patient records database access restricted to high-level admin.</p>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default AdminView;