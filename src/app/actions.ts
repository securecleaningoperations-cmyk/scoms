"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function addEmployeeAction(userData: {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}) {
  try {
    const userId = crypto.randomUUID();
    const hireDate = new Date().toISOString().split('T')[0];

    // Step 1: Insert into public.users (always — this holds name/email/role)
    const { error: userErr } = await supabaseAdmin.from('users').insert([{
      id: userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role || 'field_employee',
      status: 'active',
    }]);
    if (userErr) console.warn("users insert:", userErr.message);

    // Step 2: Try minimal employees insert (user_id + hire_date only)
    const { error: empErr } = await supabaseAdmin.from('employees').insert([{
      user_id: userId,
      hire_date: hireDate,
      status: 'active',
    }]);

    if (empErr) {
      // If the DB has ghost name columns, include them to satisfy NOT NULL
      console.warn("employees minimal insert failed, trying with name columns:", empErr.message);
      const { error: empErr2 } = await supabaseAdmin.from('employees').insert([{
        user_id: userId,
        hire_date: hireDate,
        status: 'active',
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.role || 'field_employee',
      }]);
      if (empErr2) {
        console.error("employees insert failed:", empErr2.message);
        return { success: false, error: empErr2.message };
      }
    }

    return { success: true, userId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEmployeeAction(employeeId: string, userId?: string) {
  try {
    await supabaseAdmin.from('employees').delete().eq('id', employeeId);
    if (userId) {
      await supabaseAdmin.from('users').delete().eq('id', userId);
      try { await supabaseAdmin.auth.admin.deleteUser(userId); } catch (_) {}
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearAllEmployeesAction() {
  try {
    await supabaseAdmin.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addPayrollRunAction(data: any) {
  try {
    const { error } = await supabaseAdmin.from('payroll_runs').insert([data]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function insertDataAction(table: string, data: any) {
  try {
    const { error } = await supabaseAdmin.from(table).insert([data]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// AI PHONE AGENT ACTIONS (TOOL EXECUTION)
// ==========================================

export async function createLeadAction(data: {
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  email: string;
  facility_type: string;
  square_footage: number;
  notes: string;
}) {
  try {
    const { error } = await supabaseAdmin.from('leads').insert([{
      ...data,
      status: 'new'
    }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createSupportTicketAction(data: {
  customer_id?: string;
  title: string;
  description: string;
  priority: string;
}) {
  try {
    const { error } = await supabaseAdmin.from('support_tickets').insert([{
      ...data,
      status: 'open',
      created_via: 'ai_phone'
    }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scheduleAppointmentAction(data: {
  title: string;
  location: string;
  job_date: string;
  start_time: string;
  client_id?: string;
  type: string;
}) {
  try {
    const { error } = await supabaseAdmin.from('jobs').insert([{
      ...data,
      status: 'Created'
    }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

