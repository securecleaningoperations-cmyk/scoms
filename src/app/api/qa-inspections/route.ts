import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnlzkttahekgjjgiavip.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from('qa_inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('Error fetching qa_inspections:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inspector_id, score, status, notes, client_id, checklist } = body;

    const supabaseAdmin = getAdminClient();
    const payload = {
      inspector_id: inspector_id || 'Lead Quality Inspector',
      score: Number(score) || 90,
      status: status || 'passed',
      notes: notes || 'Standard QA inspection completed.',
      client_id: client_id || null,
      checklist: checklist || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('qa_inspections')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Error creating QA inspection:', err);
    return NextResponse.json({ error: err.message || 'Failed to create inspection' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from('qa_inspections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
