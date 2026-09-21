import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getAdminClient();

  try {
    // Check if quotes table exists
    const { data: quotes, error: quotesErr } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!quotesErr && quotes) {
      return NextResponse.json({ data: quotes });
    }

    // Fallback to proposals table which stores 3-tier quotes/proposals
    const { data: proposals, error: propErr } = await supabase
      .from('proposals')
      .select('id, proposal_number, title, status, silver_price, gold_price, platinum_price, expires_at, created_at, client_id')
      .order('created_at', { ascending: false });

    if (propErr) {
      return NextResponse.json({ data: [] });
    }

    const mapped = (proposals || []).map((p: any) => ({
      id: p.id,
      client_id: p.client_id,
      amount: p.gold_price || p.silver_price || p.platinum_price || 0,
      status: p.status === 'sent' ? 'Sent' : p.status === 'accepted' ? 'Approved' : p.status === 'draft' ? 'Draft' : p.status || 'Draft',
      notes: p.title || p.proposal_number,
      valid_until: p.expires_at ? p.expires_at.split('T')[0] : null,
      created_at: p.created_at,
    }));

    return NextResponse.json({ data: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getAdminClient();

  try {
    const body = await request.json();
    const { client_id, amount, notes, valid_until, status } = body;

    const numAmount = parseFloat(amount) || 0;
    const qNum = `QTE-${Math.floor(100000 + Math.random() * 900000)}`;

    // Try inserting into quotes table first
    const { data: qData, error: qErr } = await supabase
      .from('quotes')
      .insert([{
        client_id: client_id || null,
        amount: numAmount,
        notes: notes || null,
        valid_until: valid_until || null,
        status: status || 'Draft',
      }])
      .select()
      .single();

    if (!qErr && qData) {
      return NextResponse.json({ data: qData }, { status: 201 });
    }

    // Otherwise insert into proposals table
    const propPayload: any = {
      proposal_number: qNum,
      title: notes || `Commercial Quote ${qNum}`,
      status: (status || 'Draft').toLowerCase(),
      client_id: client_id || null,
      silver_price: numAmount,
      gold_price: Math.round(numAmount * 1.3),
      platinum_price: Math.round(numAmount * 1.6),
      expires_at: valid_until ? new Date(valid_until).toISOString() : null,
    };

    const { data: propData, error: propErr } = await supabase
      .from('proposals')
      .insert([propPayload])
      .select()
      .single();

    if (propErr) {
      return NextResponse.json({ error: propErr.message }, { status: 400 });
    }

    const result = {
      id: propData.id,
      client_id: propData.client_id,
      amount: propData.silver_price,
      status: status || 'Draft',
      notes: propData.title,
      valid_until: valid_until || null,
      created_at: propData.created_at,
    };

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = getAdminClient();

  try {
    const body = await request.json();
    const { id, client_id, amount, notes, valid_until, status } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const numAmount = parseFloat(amount) || 0;

    // Try quotes table
    const { error: qErr } = await supabase
      .from('quotes')
      .update({
        client_id: client_id || null,
        amount: numAmount,
        notes: notes || null,
        valid_until: valid_until || null,
        status: status || 'Draft',
      })
      .eq('id', id);

    if (!qErr) {
      return NextResponse.json({ success: true });
    }

    // Try proposals table
    const { error: propErr } = await supabase
      .from('proposals')
      .update({
        client_id: client_id || null,
        title: notes || undefined,
        status: status ? status.toLowerCase() : undefined,
        silver_price: numAmount || undefined,
        expires_at: valid_until ? new Date(valid_until).toISOString() : undefined,
      })
      .eq('id', id);

    if (propErr) {
      return NextResponse.json({ error: propErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = getAdminClient();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await supabase.from('quotes').delete().eq('id', id);
    await supabase.from('proposals').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
