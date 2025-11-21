import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { InventoryItem } from '../types';

const data = [
  { name: 'Mon', Consultations: 40, Critical: 24 },
  { name: 'Tue', Consultations: 30, Critical: 13 },
  { name: 'Wed', Consultations: 20, Critical: 5 },
  { name: 'Thu', Consultations: 27, Critical: 39 },
  { name: 'Fri', Consultations: 18, Critical: 48 },
  { name: 'Sat', Consultations: 23, Critical: 38 },
  { name: 'Sun', Consultations: 34, Critical: 43 },
];

const AdminView: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
      const loadData = async () => {
          const inv = await api.inventory.getAll();
          setInventory(inv);
      }
      loadData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Admin Overview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-bold text-slate-700 mb-4">Weekly Consultations</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Consultations" fill="#0d9488" />
                            <Bar dataKey="Critical" fill="#f43f5e" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-bold text-slate-700 mb-4">Kiosk Inventory Levels</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold">
                            <tr>
                                <th className="p-3">Medicine</th>
                                <th className="p-3">Stock / Unit</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((row, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-3 text-slate-800">{row.name}</td>
                                    <td className="p-3 font-mono">{row.stock} {row.unit}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            row.stock <= row.threshold ? 'bg-red-100 text-red-600' :
                                            row.stock <= row.threshold * 1.5 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {row.stock <= row.threshold ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminView;