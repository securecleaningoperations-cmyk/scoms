"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Clock, AlertTriangle, GraduationCap, Search, ChevronDown, Plus, Loader2, X, Upload, File, CheckCircle, Trash2, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TRAINING_TYPES = [
  "OSHA Safety Compliance",
  "Chemical Handling Protocol",
  "Fire Safety & Evacuation",
  "First Aid & Emergency Response",
  "Equipment Operation",
  "Customer Service Standards",
  "Infection Control",
  "Environmental Compliance",
  "Leadership Development",
];

export default function TrainingPage() {
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    employee_id: "",
    type: "OSHA Safety Compliance",
    status: "in_progress",
    score: "",
    instructor: "",
    completed_date: "",
    expiry_date: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);

    // Fetch training records with employee + user data
    const { data: trainingRows } = await supabase
      .from('trainings')
      .select('*, employees(user_id, users(first_name, last_name))')
      .order('created_at', { ascending: false });

    const rows = trainingRows || [];
    setTrainingData(rows);

    // Compute real stats
    const now = new Date();
    const completed = rows.filter((r: any) => r.status === 'Completed' || r.status === 'completed').length;
    const inProgress = rows.filter((r: any) => r.status === 'in_progress' || r.status === 'In Progress').length;
    const overdue = rows.filter((r: any) => r.expiry_date && new Date(r.expiry_date) < now && r.status !== 'Completed').length;
    setStats({ total: rows.length, completed, inProgress, overdue });

    // Fetch employees for dropdown
    const { data: empData } = await supabase
      .from('employees')
      .select('id, user_id, users(first_name, last_name)');
    setEmployees(empData || []);

    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    let videoUrl = null;

    // Upload video to Supabase Storage if selected
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop();
      const filePath = `training-videos/${Date.now()}_${selectedFile.name}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, { contentType: selectedFile.type, upsert: false });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        videoUrl = urlData?.publicUrl || null;
      } else {
        console.warn("Storage upload failed (bucket may not exist):", uploadErr?.message);
      }
    }

    // Insert training record
    const trainingPayload: any = {
      employee_id: formState.employee_id || null,
      type: formState.type,
      status: formState.status === 'completed' ? 'Completed' : 'In Progress',
      score: formState.score ? Number(formState.score) : null,
      instructor: formState.instructor || 'SCOMS Academy',
      completed_date: formState.completed_date || null,
      expiry_date: formState.expiry_date || null,
    };
    if (videoUrl) trainingPayload.video_url = videoUrl;

    const { error } = await supabase.from('trainings').insert([trainingPayload]);
    if (!error) {
      setShowModal(false);
      setSelectedFile(null);
      setFormState({
        employee_id: "",
        type: "OSHA Safety Compliance",
        status: "in_progress",
        score: "",
        instructor: "",
        completed_date: "",
        expiry_date: "",
      });
      await fetchAll();
    } else {
      alert("Error adding training: " + error.message);
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this training record?")) return;
    await supabase.from('trainings').delete().eq('id', id);
    fetchAll();
  };

  const filtered = trainingData.filter((r: any) =>
    (r.type || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.employees?.users?.first_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search training records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Assign Training
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          Training Management
          {stats.overdue > 0 && (
            <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">{stats.overdue} overdue</span>
          )}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Track employee training, compliance, and certification records</p>
      </div>

      {/* Stats — real counts from DB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: GraduationCap, color: "blue" },
          { label: "Completed", value: stats.completed, icon: BookOpen, color: "emerald" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "amber" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "red" },
        ].map(m => (
          <div key={m.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-${m.color}-50 flex items-center justify-center`}>
              <m.icon className={`w-6 h-6 text-${m.color}-500`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase">
            <tr>
              <th className="px-4 py-4">Employee</th>
              <th className="px-4 py-4">Training Type</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Score</th>
              <th className="px-4 py-4">Completed</th>
              <th className="px-4 py-4">Expiry</th>
              <th className="px-4 py-4">Instructor</th>
              <th className="px-4 py-4">Video</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading training records from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No training records found.</p>
                  <p className="text-xs mt-1">Click "Assign Training" to create the first record.</p>
                </td>
              </tr>
            ) : filtered.map(record => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">
                    {record.employees?.users?.first_name} {record.employees?.users?.last_name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{record.employee_id?.split('-')[0]?.toUpperCase()}</div>
                </td>
                <td className="px-4 py-4 text-slate-700 font-medium">{record.type}</td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize
                    ${record.status === 'Completed' || record.status === 'completed'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {record.score ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${record.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{record.score}%</span>
                    </div>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-4 text-slate-500">{record.completed_date ? new Date(record.completed_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-4 text-slate-500">{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-4 text-slate-700">{record.instructor || '—'}</td>
                <td className="px-4 py-4">
                  {record.video_url ? (
                    <button onClick={() => setVideoModalUrl(record.video_url)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" /> Watch
                    </button>
                  ) : <span className="text-slate-300 text-xs">None</span>}
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => handleDelete(record.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Training Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Assign Training Record</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddTraining} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                  value={formState.employee_id}
                  onChange={e => setFormState({ ...formState, employee_id: e.target.value })}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.users?.first_name || 'Staff'} {emp.users?.last_name || ''} — {emp.id.slice(0, 6)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Training Type</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  value={formState.type}
                  onChange={e => setFormState({ ...formState, type: e.target.value })}
                >
                  {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    value={formState.status}
                    onChange={e => setFormState({ ...formState, status: e.target.value })}
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Score (%)</label>
                  <input
                    type="number"
                    min="0" max="100"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="85"
                    value={formState.score}
                    onChange={e => setFormState({ ...formState, score: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="e.g. John Smith / SCOMS Academy"
                  value={formState.instructor}
                  onChange={e => setFormState({ ...formState, instructor: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Completed Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.completed_date} onChange={e => setFormState({ ...formState, completed_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.expiry_date} onChange={e => setFormState({ ...formState, expiry_date: e.target.value })} />
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Training Video (MP4, WebM) — Stored in Supabase</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,application/pdf,.doc,.docx" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center"
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-blue-600 mb-1" />
                      <p className="text-sm font-semibold text-slate-800">Click to Select Training Video</p>
                      <p className="text-xs text-slate-400 mt-0.5">MP4, WebM, PDF up to 500MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Training Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalUrl && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-black rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col relative">
            <div className="flex justify-between items-center p-4 bg-slate-900 text-white">
              <h3 className="font-semibold flex items-center gap-2"><Video className="w-4 h-4" /> Training Video</h3>
              <button onClick={() => setVideoModalUrl(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <video 
                src={videoModalUrl} 
                controls 
                autoPlay
                className="w-full h-full object-contain"
                onEnded={() => {
                  // Optional: Mark as complete automatically when ended
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
