"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser } from "@/lib/services/customerPortal";
import { supabase } from "@/lib/supabase";
import { FileText, Download, Loader2, Folder, CheckCircle2, ShieldCheck } from "lucide-react";

export default function PortalDocumentsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      setPortalUser(pu);
      
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'client')
        .eq('entity_id', pu.client_id)
        .order('created_at', { ascending: false });
        
      setDocuments(data ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-blue-500" /></div>;

  const categories = Array.from(new Set(documents.map(d => d.document_type || 'General')));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar clientName={portalUser?.clients?.name} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Documents &amp; Contracts</h1>
              <p className="text-slate-500 text-sm mt-0.5">Secure access to your service agreements, insurance certificates, and reports.</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
              <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center text-slate-400">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg text-slate-700">No documents available</p>
              <p className="text-sm mt-2">When contracts or certificates are uploaded to your account, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map(cat => {
                const catsDocs = documents.filter(d => (d.document_type || 'General') === cat);
                return (
                  <div key={cat}>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-500" /> {cat.replace(/_/g, ' ')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {catsDocs.map(doc => (
                        <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                              <p className="text-xs text-slate-400 mt-0.5">Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                              {doc.status === 'signed' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-2">
                                  <CheckCircle2 className="w-3 h-3" /> Fully Executed
                                </span>
                              )}
                            </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download Document">
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
