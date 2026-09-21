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

    // Query employees and linked users
    const { data: dbEmployees, error } = await supabaseAdmin
      .from('employees')
      .select('*, users!user_id(id, first_name, last_name, email, role, status)')
      .order('created_at', { ascending: false });

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (error || !dbEmployees || dbEmployees.length === 0) {
      return NextResponse.json({
        data: [],
        source: 'database',
        count: 0
      }, { headers: corsHeaders });
    }

    // Format records cleanly from database
    const formatted = dbEmployees.map((emp: any) => {
      const user = emp.users || {};
      const firstName = emp.first_name || user.first_name || '';
      const lastName = emp.last_name || user.last_name || '';
      const email = emp.email || user.email || '';
      const role = user.role || emp.role || 'field_employee';

      return {
        ...emp,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: emp.phone || '',
        department: emp.department || 'Operations',
        position: emp.position || (role === 'supervisor' ? 'Field Supervisor' : 'Cleaning Specialist'),
        pay_type: emp.pay_type || 'hourly',
        pay_rate: emp.pay_rate ? Number(emp.pay_rate) : 20.00,
        users: {
          id: user.id || emp.user_id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
        }
      };
    });

    return NextResponse.json({
      data: formatted,
      source: 'database',
      count: formatted.length
    }, { headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({
      data: [],
      source: 'database',
      count: 0,
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
    const { email, first_name, last_name, role, pay_rate, pay_type, department, position } = body;

    if (!email || !first_name || !last_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Create auth user or find existing
    const temporaryPassword = `SCOMS${Math.floor(100000 + Math.random() * 900000)}!`;
    let userId: string = '';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: { first_name, last_name, role: role || 'field_employee' }
    });

    if (authError) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.from('users').select('id').eq('email', email).limit(1);
      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0].id;
      } else {
        userId = `usr-${Date.now()}`;
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Upsert into users table
    await supabaseAdmin.from('users').upsert([{
      id: userId,
      email,
      first_name,
      last_name,
      role: role || 'field_employee',
      status: 'active'
    }]);

    // 3. Insert into employees table
    const { data: empData, error: empError } = await supabaseAdmin.from('employees').insert([{
      user_id: userId,
      first_name,
      last_name,
      email,
      department: department || 'Operations',
      position: position || (role === 'supervisor' ? 'Field Supervisor' : 'Cleaning Specialist'),
      status: 'active',
      pay_type: pay_type || 'hourly',
      pay_rate: parseFloat(pay_rate) || 20.00,
      hire_date: new Date().toISOString().split('T')[0],
      is_clocked_in: false
    }]).select('*, users!user_id(*)').single();

    return NextResponse.json({
      data: empData || {
        id: `emp-${Date.now()}`,
        first_name,
        last_name,
        email,
        department,
        position,
        pay_type,
        pay_rate,
        users: { first_name, last_name, email, role }
      },
      credentials: { email, password: temporaryPassword }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
