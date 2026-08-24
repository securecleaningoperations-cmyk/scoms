import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// This handles the initial webhook from Twilio when someone calls the provisioned number
export async function POST(req: Request) {
  try {
    // Twilio sends data as application/x-www-form-urlencoded
    const body = await req.text();
    const params = new URLSearchParams(body);
    
    const callSid = params.get('CallSid') || '';
    const from = params.get('From') || '';
    const to = params.get('To') || '';
    
    // Step 1: Identify the caller
    let callerType = 'unknown';
    let callerId = null;
    let greeting = 'Welcome to Secure Cleaning Operations Inc.';

    // Check if it's an employee
    const { data: empData } = await supabaseAdmin.from('users').select('id, first_name').eq('role', 'field_employee').limit(1);
    // In a real scenario, you would match by phone number, e.g. .eq('phone', from)
    
    // For now, let's just log the incoming call
    await supabaseAdmin.from('ai_voice_calls').insert([{
      call_sid: callSid,
      direction: 'inbound',
      from_number: from,
      to_number: to,
      caller_type: callerType,
      status: 'ringing'
    }]);

    // Step 2: Generate TwiML to connect to the Voice AI stream (e.g. Vapi or Twilio Media Streams)
    // For now, we will respond with a placeholder message since the actual Voice AI provider (Vapi/OpenAI) needs API keys
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">
        Hello! You have reached the Secure Cleaning Operations A.I. assistant. 
        The system is currently undergoing final configuration. Please call back later.
    </Say>
    <!-- When using OpenAI Realtime or Vapi, you would use a <Connect><Stream> element here -->
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in Twilio Incoming Webhook:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>', {
      status: 500,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
