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
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('Error fetching incidents:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, severity, location, description, immediate_action } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();
    const incNum = `INC-${Date.now().toString().slice(-6)}`;

    // Build description including location note if provided
    const fullDescription = location ? `[Location: ${location}]\n${description}` : description;

    const payload = {
      incident_number: incNum,
      title: title.trim(),
      type: type || 'chemical',
      severity: severity || 'medium',
      status: 'reported',
      description: fullDescription,
      immediate_action: immediate_action ? immediate_action.trim() : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('incidents')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Error creating incident:', err);
    return NextResponse.json({ error: err.message || 'Failed to create incident' }, { status: 500 });
  }
}
