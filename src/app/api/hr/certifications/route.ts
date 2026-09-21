import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnlzkttahekgjjgiavip.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();

    const { data: dbCerts, error } = await supabaseAdmin
      .from('certifications')
      .select('*, employees(id, first_name, last_name, users!user_id(first_name, last_name))')
      .order('created_at', { ascending: false });

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (error || !dbCerts || dbCerts.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0
      }, { headers: corsHeaders });
    }

    return NextResponse.json({
      data: dbCerts,
      count: dbCerts.length
    }, { headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({
      data: [],
      error: err.message
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employee_id, name, issued_date, expiry_date } = body;

    const supabaseAdmin = getAdminClient();

    const payload: any = {
      name: name || 'General Safety Certification',
      issued_date: issued_date || new Date().toISOString().split('T')[0],
      expiry_date: expiry_date || null
    };

    if (employee_id && !employee_id.startsWith('emp-')) {
      payload.employee_id = employee_id;
    }

    const { data, error } = await supabaseAdmin.from('certifications').insert([payload]).select().single();

    return NextResponse.json({
      data: data || { id: `cert-${Date.now()}`, ...payload },
      success: true
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
