import React, { useState } from 'react';
import { Activity, Heart, Scale, AlertTriangle, CheckCircle, ClipboardList, AlertCircle, Stethoscope, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { analyzeHealthScore } from '../services/geminiService';

const SwasthyaScore: React.FC = () => {
  const [data, setData] = useState({
    age: '35',
    heartRate: '72',
    bp: '120/80',
    weight: '70',
    activity: 'Moderate',
    history: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const analysis = await analyzeHealthScore(data);
    setResult(analysis);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const chartData = result ? [
    { name: 'Score', value: result.score },
    { name: 'Remaining', value: 100 - result.score }
  ] : [];

  const calculateDate = (label: string) => {
      const today = new Date();
      // Simple mock logic for demo purposes based on label
      if (label?.toLowerCase().includes("immediate")) return today.toLocaleDateString();
      if (label?.toLowerCase().includes("week")) return new Date(today.setDate(today.getDate() + 7)).toLocaleDateString();
      if (label?.toLowerCase().includes("month")) return new Date(today.setMonth(today.getMonth() + 1)).toLocaleDateString();
      return new Date(today.setMonth(today.getMonth() + 6)).toLocaleDateString();
  }

  return (
    <div className="h-full overflow-y-auto p-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-emerald-600" />
            Health Index Calculator
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Our AI analyzes your vitals, history, and current symptoms to generate a predictive health risk score.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={data.age}
                onChange={(e) => setData({...data, age: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={data.weight}
                  onChange={(e) => setData({...data, weight: e.target.value})}
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (BPM)</label>
              <div className="relative">
                <Heart className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={data.heartRate}
                  onChange={(e) => setData({...data, heartRate: e.target.value})}
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
              <input
                type="text"
                placeholder="120/80"
                value={data.bp}
                onChange={(e) => setData({...data, bp: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              value={data.activity}
              onChange={(e) => setData({...data, activity: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="Sedentary">Sedentary (Little/No exercise)</option>
              <option value="Moderate">Moderate (Exercise 1-3 times/week)</option>
              <option value="Active">Active (Daily exercise)</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <ClipboardList className="w-4 h-4 text-gray-500" /> Medical History
             </label>
             <textarea 
                value={data.history}
                onChange={(e) => setData({...data, history: e.target.value})}
                placeholder="e.g., Diabetes, Hypertension, Asthma, Previous Surgeries"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 text-sm resize-none"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-gray-500" /> Current Complaints
             </label>
             <textarea 
                value={data.symptoms}
                onChange={(e) => setData({...data, symptoms: e.target.value})}
                placeholder="e.g., Mild fever for 2 days, headache, fatigue"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 text-sm resize-none"
             />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 font-medium"
          >
            {loading && <Activity className="animate-spin w-5 h-5" />}
            {loading ? 'Calculating Risk Profile...' : 'Calculate Swasthya Score'}
          </button>
        </form>
      </div>

      {/* Results Display */}
      <div className="flex flex-col gap-6">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          {!result ? (
            <div className="text-center text-gray-400 max-w-xs">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Activity className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold text-gray-500">Awaiting Data</h3>
              <p className="text-sm mt-1">Fill in your details and vitals to generate your comprehensive health risk profile.</p>
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell key="score" fill={getScoreColor(result.score)} />
                      <Cell key="bg" fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-4xl font-bold" style={{ color: getScoreColor(result.score) }}>
                    {result.score}
                  </span>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Score</p>
                </div>
              </div>
              <div className="text-center mt-[-30px] w-full">
                <h3 className="text-lg font-semibold" style={{ color: getScoreColor(result.score) }}>
                  {result.riskLevel} Risk Profile
                </h3>
                <div className={`mt-4 p-4 rounded-xl text-sm text-left ${
                    result.score < 60 ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-700'
                }`}>
                    <p className="font-medium mb-1 flex items-center gap-2">
                        {result.score < 60 && <AlertTriangle className="w-4 h-4" />}
                        Analysis Summary
                    </p>
                    <p>{result.summary}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recommendations & Doctor Link */}
        {result && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Actionable Insights
                </h3>
                <ul className="space-y-3">
                {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-emerald-800 bg-white/50 p-2 rounded-lg">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                    </li>
                ))}
                </ul>
            </div>

            {/* Doctor Suggestion Footer */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
                
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-emerald-400" />
                            Suggested Consultation
                        </h4>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4">Based on your score</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="bg-slate-700/50 p-3 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">Recommended Specialist</p>
                        <p className="font-bold text-white">{result.suggestedDoctor}</p>
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-800 p-3 rounded-xl">
                        <p className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                            <Calendar size={12}/> Suggested Date
                        </p>
                        <p className="font-bold text-emerald-100">{calculateDate(result.nextCheckupLabel)}</p>
                        <p className="text-[10px] text-emerald-400/70 mt-1">{result.nextCheckupLabel}</p>
                    </div>
                </div>

                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition shadow-md">
                    Book Appointment Now
                </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SwasthyaScore;