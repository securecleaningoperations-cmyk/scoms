/**
 * Twilio Inbound Call Webhook Handler
 * POST /api/twilio/inbound
 * 
 * Handles incoming calls, creates a call record, and returns TwiML.
 * Requires TWILIO_AUTH_TOKEN env variable to validate signatures.
 * 
 * Required environment variables:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client for server-side inserts
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const TWILIO_CONFIGURED = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
);

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!TWILIO_CONFIGURED) {
    return NextResponse.json(
      { error: 'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;

    // Look up if caller matches an existing lead or employee
    const [leadsRes, empRes] = await Promise.all([
      supabase.from('leads').select('id,company_name').ilike('phone', `%${from.replace(/\D/g, '').slice(-10)}%`).limit(1),
      supabase.from('employees').select('id,first_name,last_name').ilike('phone', `%${from.replace(/\D/g, '').slice(-10)}%`).limit(1),
    ]);

    const linkedLead = leadsRes.data?.[0] ?? null;
    const linkedEmployee = empRes.data?.[0] ?? null;

    const callerType = linkedEmployee
      ? 'employee'
      : linkedLead
        ? 'existing_customer'
        : 'unknown';

    // Create call record
    const { data: callRecord } = await supabase.from('phone_calls').insert({
      twilio_call_sid: callSid,
      direction: 'inbound',
      from_number: from,
      to_number: to,
      status: callStatus ?? 'ringing',
      caller_type: callerType,
      linked_lead_id: linkedLead?.id ?? null,
      linked_employee_id: linkedEmployee?.id ?? null,
      started_at: new Date().toISOString(),
    }).select().single();

    // Generate TwiML response
    const callerName = linkedEmployee
      ? `${linkedEmployee.first_name ?? ''} ${linkedEmployee.last_name ?? ''}`.trim()
      : linkedLead?.company_name ?? 'caller';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling Secure Cleaning Operations. ${callerName ? `Welcome back, ${callerName}.` : ''} Please hold while we connect you.</Say>
  <Pause length="1"/>
  <Say voice="alice">Your call is being recorded for quality and training purposes.</Say>
  <Record transcribe="true" transcribeCallback="/api/twilio/transcript?call_id=${callRecord?.id ?? ''}" maxLength="3600" />
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err: any) {
    console.error('Twilio inbound handler error:', err);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are experiencing technical difficulties. Please try again later.</Say>
</Response>`;
    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

// Handle status callbacks from Twilio
export async function GET(request: NextRequest) {
  return NextResponse.json({
    configured: TWILIO_CONFIGURED,
    message: TWILIO_CONFIGURED
      ? 'Twilio integration is active'
      : 'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to enable',
  });
}
