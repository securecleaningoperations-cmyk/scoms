import { NextResponse } from 'next/server';
import { createLeadAction, createSupportTicketAction, scheduleAppointmentAction } from '@/app/actions';

// This endpoint receives tool call webhooks from the Voice AI Provider (e.g. Vapi.ai / Retell)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;
    
    // Most Voice AI providers send a 'tool_calls' or 'function_call' message
    if (message.type === 'tool_calls' || message.type === 'function-call') {
      const toolCalls = message.toolCalls || message.functionCallList || [];
      const responses = [];

      for (const call of toolCalls) {
        const functionName = call.function.name;
        const args = JSON.parse(call.function.arguments);
        let result: any = null;

        switch (functionName) {
          case 'create_lead':
            result = await createLeadAction(args);
            break;
          case 'create_support_ticket':
            result = await createSupportTicketAction(args);
            break;
          case 'schedule_appointment':
            result = await scheduleAppointmentAction(args);
            break;
          default:
            result = { error: 'Function not found' };
        }

        responses.push({
          toolCallId: call.id,
          result: JSON.stringify(result)
        });
      }

      // Return the tool call results back to the AI so it can speak the confirmation to the user
      return NextResponse.json({
        results: responses
      });
    }

    // Handle end of call logs / transcripts
    if (message.type === 'end-of-call-report') {
       // Save to ai_voice_calls and ai_call_transcripts
       console.log('Call ended', message.summary);
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in Voice Tools Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
