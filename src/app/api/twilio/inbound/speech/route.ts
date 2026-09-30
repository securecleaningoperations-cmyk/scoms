import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const callId = request.nextUrl.searchParams.get('call_id');

    if (!speechResult) {
       return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna-Neural">I couldn't hear you clearly. Please call back. Goodbye.</Say><Hangup/></Response>`, { headers: { 'Content-Type': 'text/xml' } });
    }

    const supabase = getSupabase();

    // Look up caller history
    const { data: callRec } = await supabase.from('phone_calls').select('caller_type').eq('twilio_call_sid', callSid).single();
    
    let callerHistory = undefined;
    if (callRec) {
        callerHistory = {
            isClient: callRec.caller_type === 'existing_customer',
            isEmployee: callRec.caller_type === 'employee'
        }
    }

    // Call the AI Phone Agent Route locally using absolute URL
    const origin = request.nextUrl.origin || 'http://localhost:3000';
    const aiRes = await fetch(`${origin}/api/ai/jev/phone-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            transcript: speechResult,
            fromNumber: from,
            autoExecuteAction: true,
            callerHistory
        })
    });

    const aiJson = await aiRes.json();
    let twimlResponse = "We have received your request and will follow up shortly.";
    let escalated = false;

    if (aiJson.success && aiJson.data) {
        twimlResponse = aiJson.data.suggestedTwiMLGreeting;
        escalated = aiJson.data.requiresHumanOverride;

        // Optionally, update the specific phone_calls row created by inbound
        if (callId) {
            await supabase.from('phone_calls').update({
               ai_summary: `${aiJson.data.urgencyLabel} - ${aiJson.data.recommendedAction}`,
               workflow: aiJson.data.departmentRoute,
               status: 'completed'
            }).eq('id', callId);
        }
    }

    let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${twimlResponse}</Say>
  <Pause length="1"/>
`;

    if (escalated) {
        twiml += `
  <Say voice="Polly.Joanna-Neural">I am transferring you to a human supervisor now. Please hold.</Say>
  <Dial>+1555019999</Dial>
</Response>`;
    } else {
        twiml += `
  <Say voice="Polly.Joanna-Neural">Thank you for contacting Secure Cleaning Operations. Goodbye!</Say>
  <Hangup/>
</Response>`;
    }

    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });

  } catch (err: any) {
    console.error('Twilio speech handler error:', err);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred processing your request.</Say><Hangup/></Response>`, { headers: { 'Content-Type': 'text/xml' } });
  }
}
