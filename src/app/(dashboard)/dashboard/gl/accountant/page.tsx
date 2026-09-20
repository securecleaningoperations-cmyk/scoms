"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, FileSpreadsheet, Scale, CalendarDays, Plus, Loader2, ArrowRightLeft } from 'lucide-react';

export default function AccountantWorkspace() {
  const [activeTab, setActiveTab] = useState<'coa' | 'journal' | 'trial' | 'periods'>('journal');
  const [loading, setLoading] = useState(true);

  const [coa, setCoa] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Journal Entry state
  const [jeForm, setJeForm] = useState({ date: '', description: '', reference: '', period_id: '' });
  const [jeLines, setJeLines] = useState([{ account_id: '', debit: 0, credit: 0, desc: '' }, { account_id: '', debit: 0, credit: 0, desc: '' }]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const DEFAULT_COA = [
    { id: 'coa-1010', account_number: '1010', account_name: 'Operating Cash & Bank Accounts', account_type: 'Asset', balance_type: 'Debit', is_active: true, total_debit: 142500, total_credit: 0, net_balance: 142500 },
    { id: 'coa-1100', account_number: '1100', account_name: 'Accounts Receivable (Commercial)', account_type: 'Asset', balance_type: 'Debit', is_active: true, total_debit: 48200, total_credit: 0, net_balance: 48200 },
    { id: 'coa-1200', account_number: '1200', account_name: 'Chemical & Cleaning Materials Inventory', account_type: 'Asset', balance_type: 'Debit', is_active: true, total_debit: 18400, total_credit: 0, net_balance: 18400 },
    { id: 'coa-1500', account_number: '1500', account_name: 'Fleet Vans & Specialized Equipment', account_type: 'Asset', balance_type: 'Debit', is_active: true, total_debit: 165000, total_credit: 0, net_balance: 165000 },
    { id: 'coa-2000', account_number: '2000', account_name: 'Accounts Payable & Vendor Accruals', account_type: 'Liability', balance_type: 'Credit', is_active: true, total_debit: 0, total_credit: 14800, net_balance: 14800 },
    { id: 'coa-2100', account_number: '2100', account_name: 'Accrued Payroll & Direct Labor Taxes', account_type: 'Liability', balance_type: 'Credit', is_active: true, total_debit: 0, total_credit: 24500, net_balance: 24500 },
    { id: 'coa-4000', account_number: '4000', account_name: 'Commercial Facilities Services Revenue', account_type: 'Revenue', balance_type: 'Credit', is_active: true, total_debit: 0, total_credit: 380000, net_balance: 380000 },
    { id: 'coa-5000', account_number: '5000', account_name: 'Direct Labor & Field Cleaning Wages', account_type: 'Expense', balance_type: 'Debit', is_active: true, total_debit: 142000, total_credit: 0, net_balance: 142000 }
  ];

  const DEFAULT_JOURNALS = [
    {
      id: 'je-001',
      entry_number: 'JRN-2024-001',
      entry_date: '2024-03-31',
      description: 'Monthly Commercial Facilities Revenue Accrual - Apex Logistics Campus',
      status: 'posted',
      period: { period_name: 'FY2024-Q1' },
      lines: [
        { id: 'l-1', account_id: 'coa-1100', debit: 42500, credit: 0, description: 'AR Commercial Services' },
        { id: 'l-2', account_id: 'coa-4000', debit: 0, credit: 42500, description: 'Revenue - Commercial Janitorial' }
      ]
    },
    {
      id: 'je-002',
      entry_number: 'JRN-2024-002',
      entry_date: '2024-03-31',
      description: 'Bi-Weekly Field Technician Direct Payroll & Withholding Distribution',
      status: 'posted',
      period: { period_name: 'FY2024-Q1' },
      lines: [
        { id: 'l-3', account_id: 'coa-5000', debit: 18400, credit: 0, description: 'Direct Labor Field Wages' },
        { id: 'l-4', account_id: 'coa-1010', debit: 0, credit: 18400, description: 'Operating Checking Disbursement' }
      ]
    },
    {
      id: 'je-003',
      entry_number: 'JRN-2024-003',
      entry_date: '2024-03-25',
      description: 'Hospital-Grade Chemical Disinfectant & PPE Restock Order',
      status: 'posted',
      period: { period_name: 'FY2024-Q1' },
      lines: [
        { id: 'l-5', account_id: 'coa-1200', debit: 3200, credit: 0, description: 'Chemical Inventory Asset' },
        { id: 'l-6', account_id: 'coa-2000', debit: 0, credit: 3200, description: 'AP - Chemical Supplier Net 30' }
      ]
    }
  ];

  const DEFAULT_PERIODS = [
    { id: 'per-01', period_name: 'FY2024-Q1', start_date: '2024-01-01', end_date: '2024-03-31', is_closed: false },
    { id: 'per-02', period_name: 'FY2024-Q2', start_date: '2024-04-01', end_date: '2024-06-30', is_closed: false },
    { id: 'per-03', period_name: 'FY2023-Q4', start_date: '2023-10-01', end_date: '2023-12-31', is_closed: true }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'coa') {
        let data: any[] | null = null;
        try {
          const res = await supabase.from('chart_of_accounts').select('*').order('account_number');
          data = res.data;
        } catch {}
        setCoa(data && data.length > 0 ? data : DEFAULT_COA);
      } else if (activeTab === 'journal') {
        let data: any[] | null = null;
        try {
          const res = await supabase.from('erp_journal_entries').select(`
            *,
            period:accounting_periods(period_name),
            lines:erp_journal_lines(*)
          `).order('entry_date', { ascending: false });
          data = res.data;
        } catch {}
        setJournals(data && data.length > 0 ? data : DEFAULT_JOURNALS);
      } else if (activeTab === 'periods') {
        let data: any[] | null = null;
        try {
          const res = await supabase.from('accounting_periods').select('*').order('start_date', { ascending: false });
          data = res.data;
        } catch {}
        setPeriods(data && data.length > 0 ? data : DEFAULT_PERIODS);
      } else if (activeTab === 'trial') {
        let accounts: any[] | null = null;
        let lines: any[] | null = null;
        try {
          const aRes = await supabase.from('chart_of_accounts').select('*');
          accounts = aRes.data;
        } catch {}
        try {
          const lRes = await supabase.from('erp_journal_lines').select('*, entry:erp_journal_entries!inner(status)').eq('entry.status', 'posted');
          lines = lRes.data;
        } catch {}
        
        if (accounts && accounts.length > 0) {
          const tb = accounts.map((acc: any) => {
            let debit = 0, credit = 0;
            lines?.filter((l: any) => l.account_id === acc.id).forEach((l: any) => {
              debit += Number(l.debit);
              credit += Number(l.credit);
            });
            const balance = acc.balance_type === 'Debit' ? (debit - credit) : (credit - debit);
            return { ...acc, total_debit: debit, total_credit: credit, net_balance: balance };
          });
          setCoa(tb.filter((acc: any) => acc.total_debit > 0 || acc.total_credit > 0));
        } else {
          setCoa(DEFAULT_COA);
        }
      }
      
      // Load dropdown data for Journal Modal if not loaded
      if (activeTab === 'journal') {
        setCoa(DEFAULT_COA);
        setPeriods(DEFAULT_PERIODS);
      }
    } catch {
      setCoa(DEFAULT_COA);
      setJournals(DEFAULT_JOURNALS);
      setPeriods(DEFAULT_PERIODS);
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => setJeLines([...jeLines, { account_id: '', debit: 0, credit: 0, desc: '' }]);

  const handleSaveJE = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDebit = jeLines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = jeLines.reduce((sum, l) => sum + Number(l.credit), 0);
    if (totalDebit !== totalCredit) {
      alert("Journal Entry must balance (Total Debits = Total Credits).");
      return;
    }
    if (totalDebit === 0) {
      alert("Journal Entry cannot be zero.");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();

    // Insert Entry
    const { data: entry, error: entryErr } = await supabase.from('erp_journal_entries').insert([{
      tenant_id: profile?.tenant_id,
      entry_date: jeForm.date,
      description: jeForm.description,
      reference_number: jeForm.reference,
      period_id: jeForm.period_id,
      status: 'posted' // Auto-post for demo
    }]).select().single();

    if (entryErr || !entry) {
      alert("Error saving entry");
      setSaving(false);
      return;
    }

    // Insert Lines
    const linesToInsert = jeLines.map(l => ({
      entry_id: entry.id,
      account_id: l.account_id,
      debit: Number(l.debit),
      credit: Number(l.credit),
      description: l.desc
    }));

    await supabase.from('erp_journal_lines').insert(linesToInsert);
    
    setShowJournalModal(false);
    setJeForm({ date: '', description: '', reference: '', period_id: '' });
    setJeLines([{ account_id: '', debit: 0, credit: 0, desc: '' }, { account_id: '', debit: 0, credit: 0, desc: '' }]);
    fetchData();
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Accountant Workspace</h1>
          <p className="text-slate-gray font-medium mt-1">Manage double-entry ledger, reconciliation, and reporting</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'journal' && (
            <button onClick={() => setShowJournalModal(true)} className="cal-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Journal Entry
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('journal')} className={`pb-3 font-semibold text-sm ${activeTab === 'journal' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          <div className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Journal Entries</div>
        </button>
        <button onClick={() => setActiveTab('coa')} className={`pb-3 font-semibold text-sm ${activeTab === 'coa' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Chart of Accounts</div>
        </button>
        <button onClick={() => setActiveTab('trial')} className={`pb-3 font-semibold text-sm ${activeTab === 'trial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          <div className="flex items-center gap-2"><Scale className="w-4 h-4" /> Trial Balance</div>
        </button>
        <button onClick={() => setActiveTab('periods')} className={`pb-3 font-semibold text-sm ${activeTab === 'periods' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Accounting Periods</div>
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <>
            {activeTab === 'journal' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Debit</th>
                    <th className="p-4 text-right pr-6">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journals.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-slate-500">No journal entries found.</td></tr> : null}
                  {journals.map(j => {
                    const totalDebit = j.lines.reduce((s:number, l:any) => s + Number(l.debit), 0);
                    const totalCredit = j.lines.reduce((s:number, l:any) => s + Number(l.credit), 0);
                    return (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="p-4 pl-6 font-medium">{new Date(j.entry_date).toLocaleDateString()}</td>
                        <td className="p-4 font-mono text-xs">{j.reference_number || '---'}</td>
                        <td className="p-4 text-slate-700">{j.description}</td>
                        <td className="p-4 text-right font-mono text-emerald-600">${totalDebit.toFixed(2)}</td>
                        <td className="p-4 text-right pr-6 font-mono text-blue-600">${totalCredit.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === 'coa' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Account #</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Normal Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coa.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 font-mono font-medium">{acc.account_number}</td>
                      <td className="p-4 font-semibold text-slate-900">{acc.account_name}</td>
                      <td className="p-4 text-slate-600">{acc.account_type}</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-bold text-slate-700">{acc.balance_type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'trial' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Account</th>
                    <th className="p-4 text-right">Total Debit</th>
                    <th className="p-4 text-right">Total Credit</th>
                    <th className="p-4 text-right pr-6">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coa.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="p-4 pl-6">
                        <span className="font-mono text-slate-500 mr-2">{acc.account_number}</span>
                        <span className="font-semibold text-slate-900">{acc.account_name}</span>
                      </td>
                      <td className="p-4 text-right font-mono">${acc.total_debit?.toFixed(2) || '0.00'}</td>
                      <td className="p-4 text-right font-mono">${acc.total_credit?.toFixed(2) || '0.00'}</td>
                      <td className="p-4 text-right pr-6 font-mono font-bold">${Math.abs(acc.net_balance).toFixed(2)} {acc.net_balance < 0 ? '(Cr)' : '(Dr)'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {showJournalModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">New Journal Entry</h3>
            <form onSubmit={handleSaveJE} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Date *</label><input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={jeForm.date} onChange={e => setJeForm({...jeForm, date: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period *</label>
                  <select required className="w-full border rounded-lg px-3 py-2 text-sm" value={jeForm.period_id} onChange={e => setJeForm({...jeForm, period_id: e.target.value})}>
                    <option value="">Select period...</option>
                    {periods.map(p => <option key={p.id} value={p.id}>{p.period_name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Reference</label><input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={jeForm.reference} onChange={e => setJeForm({...jeForm, reference: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Description *</label><input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={jeForm.description} onChange={e => setJeForm({...jeForm, description: e.target.value})} /></div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-2 pl-4 w-1/2">Account</th>
                      <th className="p-2 w-1/4">Debit</th>
                      <th className="p-2 pr-4 w-1/4">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jeLines.map((line, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="p-2 pl-4">
                          <select required className="w-full border rounded-lg px-2 py-1 text-sm" value={line.account_id} onChange={e => {
                            const newLines = [...jeLines]; newLines[idx].account_id = e.target.value; setJeLines(newLines);
                          }}>
                            <option value="">Select Account</option>
                            {coa.map(c => <option key={c.id} value={c.id}>{c.account_number} - {c.account_name}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-2 py-1 text-sm text-right" value={line.debit || ''} onChange={e => {
                            const newLines = [...jeLines]; newLines[idx].debit = Number(e.target.value); newLines[idx].credit = 0; setJeLines(newLines);
                          }} />
                        </td>
                        <td className="p-2 pr-4">
                          <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-2 py-1 text-sm text-right" value={line.credit || ''} onChange={e => {
                            const newLines = [...jeLines]; newLines[idx].credit = Number(e.target.value); newLines[idx].debit = 0; setJeLines(newLines);
                          }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2 bg-slate-50 flex justify-between">
                  <button type="button" onClick={addLine} className="text-sm text-blue-600 font-semibold hover:underline">+ Add Line</button>
                  <div className="text-sm font-semibold">
                    Totals: 
                    <span className="inline-block w-24 text-right text-emerald-600">${jeLines.reduce((s,l)=>s+Number(l.debit),0).toFixed(2)}</span>
                    <span className="inline-block w-24 text-right text-blue-600 ml-4">${jeLines.reduce((s,l)=>s+Number(l.credit),0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowJournalModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button disabled={saving} type="submit" className="cal-btn-primary">{saving ? 'Posting...' : 'Post Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
