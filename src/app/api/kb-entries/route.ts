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

// GET: Fetch knowledge base entries with optional category and status filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const supabaseAdmin = getAdminClient();
    let query = supabaseAdmin
      .from('kb_entries')
      .select('*')
      .order('updated_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('Error fetching kb_entries:', err);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}

// POST: Create a new knowledge base entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, category, tags, visibility, approved_for_ai } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      visibility: visibility || 'internal',
      status: 'draft',
      approved_for_ai: !!approved_for_ai,
      version_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('kb_entries')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Error creating kb_entry:', err);
    return NextResponse.json({ error: err.message || 'Failed to create entry' }, { status: 500 });
  }
}

// PUT: Update an existing knowledge base entry
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, content, category, tags, visibility, status, approved_for_ai } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (visibility !== undefined) updates.visibility = visibility;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      } else if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }
    }
    if (approved_for_ai !== undefined) updates.approved_for_ai = !!approved_for_ai;

    const { data, error } = await supabaseAdmin
      .from('kb_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Error updating kb_entry:', err);
    return NextResponse.json({ error: err.message || 'Failed to update entry' }, { status: 500 });
  }
}

// DELETE: Delete a knowledge base entry
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from('kb_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting kb_entry:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete entry' }, { status: 500 });
  }
}
