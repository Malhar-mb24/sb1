import React, { useState } from 'react';
import { Plus, User, MoreVertical, X, Save } from 'lucide-react';
import { FamilyMember } from '../types';

const INITIAL_FAMILY: FamilyMember[] = [
    { id: '1', name: "Rahul Sharma", relation: "Self", age: 35, bloodGroup: "O+", avatarUrl: "https://picsum.photos/200/200?random=1" },
    { id: '2', name: "Priya Sharma", relation: "Spouse", age: 32, bloodGroup: "A+", avatarUrl: "https://picsum.photos/200/200?random=2" },
    { id: '3', name: "Aarav Sharma", relation: "Son", age: 8, bloodGroup: "B+", avatarUrl: "https://picsum.photos/200/200?random=3" },
];

const FamilyManager: React.FC = () => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
    const [isAdding, setIsAdding] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        relation: 'Other',
        age: '',
        bloodGroup: 'Unknown'
    });

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.age) return;

        const member: FamilyMember = {
            id: Date.now().toString(),
            name: newMember.name,
            relation: newMember.relation,
            age: parseInt(newMember.age),
            bloodGroup: newMember.bloodGroup,
            avatarUrl: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`
        };

        setFamilyMembers([...familyMembers, member]);
        setIsAdding(false);
        setNewMember({ name: '', relation: 'Other', age: '', bloodGroup: 'Unknown' });
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Family Health Profiles</h2>
                    <p className="text-gray-500">Manage records for your entire household in one place.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-default"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Member Form Card */}
                {isAdding && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-teal-100 shadow-lg relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setIsAdding(false)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold text-gray-800 text-lg mb-4">New Profile</h3>
                        <form onSubmit={handleAddMember} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Full Name</label>
                                <input 
                                    type="text" 
                                    value={newMember.name}
                                    onChange={e => setNewMember({...newMember, name: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                                    placeholder="e.g., Vikram Singh"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Age</label>
                                    <input 
                                        type="number" 
                                        value={newMember.age}
                                        onChange={e => setNewMember({...newMember, age: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Relation</label>
                                    <select 
                                        value={newMember.relation}
                                        onChange={e => setNewMember({...newMember, relation: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Spouse">Spouse</option>
                                        <option value="Child">Child</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-500">Blood Group</label>
                                <select 
                                    value={newMember.bloodGroup}
                                    onChange={e => setNewMember({...newMember, bloodGroup: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                                >
                                    <option value="Unknown">Unknown</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <button 
                                type="submit"
                                className="w-full mt-2 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Save className="w-4 h-4" /> Save Profile
                            </button>
                        </form>
                    </div>
                )}

                {/* Family Cards */}
                {familyMembers.map(member => (
                    <div key={member.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all relative group">
                        <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm relative">
                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Health Status: Good"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">{member.name}</h3>
                                <span className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                                    {member.relation}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Age</p>
                                <p className="font-semibold text-gray-800">{member.age} Yrs</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Blood</p>
                                <p className="font-semibold text-gray-800">{member.bloodGroup}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                                View Records
                            </button>
                            <button className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                History
                            </button>
                        </div>
                    </div>
                ))}
                
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all min-h-[250px] group"
                    >
                         <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center mb-3 transition-colors">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-teal-600" />
                         </div>
                         <p className="font-medium text-gray-500 group-hover:text-teal-700">Link new profile</p>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FamilyManager;