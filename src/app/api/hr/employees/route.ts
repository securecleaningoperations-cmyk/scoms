import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, role, pay_rate, pay_type, tenant_id } = body;

    if (!email || !first_name || !last_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Use service role key to create a user and insert into tables
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a secure temporary password
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let temporaryPassword = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      temporaryPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    // Ensure at least one special char, number, upper, lower if needed, but random is usually fine for temp.
    // Let's just append one of each to be safe and satisfy Supabase password rules
    temporaryPassword += "1aA!";

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: { first_name, last_name, role }
    });

    if (authError) {
      // If user already exists, we could just fetch them, but for this demo let's just return error
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into users table
    const { error: userError } = await supabaseAdmin.from('users').insert([{
      id: userId,
      tenant_id: tenant_id || null, // Ensure tenant_id is set if required
      email,
      first_name,
      last_name,
      role
    }]);

    if (userError) {
      // Try to delete auth user to cleanup
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    // 3. Insert into employees table
    const { data: empData, error: empError } = await supabaseAdmin.from('employees').insert([{
      tenant_id: tenant_id || null,
      user_id: userId,
      status: 'onboarding',
      pay_type: pay_type || 'hourly',
      pay_rate: parseFloat(pay_rate) || 0,
      hire_date: new Date().toISOString().split('T')[0]
    }]).select('*, users(*)').single();

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      data: empData,
      credentials: {
        email: email,
        password: temporaryPassword
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
