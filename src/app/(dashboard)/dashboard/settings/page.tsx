"use client";

import { useState, useEffect } from "react";
import { fetchSettings, updateSetting } from "@/lib/queries/settings";
import { Loader2, Settings2, Bell, Shield, Server, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"system" | "operational" | "notification">("system");
  
  // Local state for settings to allow optimistic UI and drafting
  const [settings, setSettings] = useState<Record<string, any>>({
    system: [],
    operational: [],
    notification: []
  });

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data);
      
      // Initialize form state
      const initialForm: Record<string, string> = {};
      [...data.system, ...data.operational, ...data.notification].forEach((item: any) => {
        initialForm[item.setting_key] = typeof item.setting_value === 'string' ? item.setting_value : JSON.stringify(item.setting_value);
      });
      setFormState(initialForm);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (table: 'system_settings' | 'operational_settings' | 'notification_settings', key: string, desc: string) => {
    setSaving(true);
    try {
      let valueToSave = formState[key];
      // Try parsing if it looks like JSON or boolean/number, otherwise save as string
      try {
        if (valueToSave === "true") valueToSave = true as any;
        else if (valueToSave === "false") valueToSave = false as any;
        else if (!isNaN(Number(valueToSave)) && String(valueToSave).trim() !== '') valueToSave = Number(valueToSave) as any;
        else valueToSave = JSON.parse(valueToSave);
      } catch (e) {
        // Keep as string
      }

      await updateSetting(table, key, valueToSave, desc);
      alert('Setting saved successfully and audit log created.');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save setting.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tableMap = {
        system: 'system_settings',
        operational: 'operational_settings',
        notification: 'notification_settings'
      };
      
      let valueToSave = newSetting.value;
      try {
        if (valueToSave === "true") valueToSave = true as any;
        else if (valueToSave === "false") valueToSave = false as any;
        else if (!isNaN(Number(valueToSave)) && String(valueToSave).trim() !== '') valueToSave = Number(valueToSave) as any;
        else valueToSave = JSON.parse(valueToSave);
      } catch (e) {}

      const table = tableMap[activeTab];
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from(table).insert([{
        setting_key: newSetting.key,
        setting_value: valueToSave,
        description: newSetting.description
      }]);
      
      if (error) throw error;
      
      setShowAddModal(false);
      setNewSetting({ key: '', value: '', description: '' });
      await loadData();
    } catch (err: any) {
      alert('Error adding setting: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "system", label: "System Settings", icon: Server },
    { id: "operational", label: "Operational Settings", icon: Settings2 },
    { id: "notification", label: "Notification Settings", icon: Bell },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-signal-blue" />
      </div>
    );
  }

  const renderSettingsList = (type: "system" | "operational" | "notification", tableName: any) => {
    const list = settings[type] || [];
    
    if (list.length === 0) {
      return (
        <div className="p-8 text-center text-slate-gray border border-dashed border-hairline rounded-xl bg-cloud/50">
          <p>No settings configured for this category yet.</p>
          <p className="text-sm mt-2">Add seed data to the {tableName} table to manage them here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((item: any) => (
          <div key={item.id} className="p-5 border border-hairline rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1">
              <h4 className="font-semibold text-ink-navy text-sm font-display mb-1">{item.setting_key}</h4>
              <p className="text-xs text-slate-gray">{item.description || "No description provided."}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="text" 
                className="flex-1 md:w-64 border border-hairline rounded-lg px-3 py-2 text-sm text-ink-navy focus:ring-1 focus:ring-signal-blue outline-none"
                value={formState[item.setting_key] || ''}
                onChange={e => setFormState({...formState, [item.setting_key]: e.target.value})}
              />
              <button 
                onClick={() => handleSave(tableName, item.setting_key, item.description || "")}
                disabled={saving}
                className="cal-btn-primary flex items-center gap-2 py-2 px-4 shadow-sm shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">System Operational</h1>
          <p className="text-slate-gray font-medium mt-1">Manage global configuration, roles, and integrations</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-signal-blue text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition">
          + Add Setting
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden shadow-sm">
        <div className="border-b border-hairline bg-paper p-5 flex gap-2 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-signal-blue text-white shadow-sm' : 'text-slate-gray hover:bg-pebble'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-cloud/30">
          {activeTab === "system" && renderSettingsList("system", "system_settings")}
          {activeTab === "operational" && renderSettingsList("operational", "operational_settings")}
          {activeTab === "notification" && renderSettingsList("notification", "notification_settings")}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New {tabs.find(t => t.id === activeTab)?.label}</h3>
            <form onSubmit={handleAddSetting} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Key Name (e.g. max_users)</label><input required type="text" value={newSetting.key} onChange={e => setNewSetting(p => ({ ...p, key: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Initial Value</label><input required type="text" value={newSetting.value} onChange={e => setNewSetting(p => ({ ...p, value: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label><input type="text" value={newSetting.description} onChange={e => setNewSetting(p => ({ ...p, description: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="bg-signal-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
