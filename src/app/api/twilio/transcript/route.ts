/**
 * Twilio Transcript Callback
 * POST /api/twilio/transcript
 * 
 * Receives transcription from Twilio, updates call record,
 * and triggers AI summary generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('call_id');
    const formData = await request.formData();
    const transcript = formData.get('TranscriptionText') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const duration = parseInt(formData.get('RecordingDuration') as string ?? '0');

    if (!callId) return NextResponse.json({ ok: false, error: 'No call_id' }, { status: 400 });

    // Build AI summary from transcript
    let aiSummary = null;
    let intent = 'unknown';

    if (transcript) {
      // Simple intent classification without external AI API
      const lower = transcript.toLowerCase();
      if (lower.includes('quote') || lower.includes('price') || lower.includes('bid') || lower.includes('estimate')) {
        intent = 'quote_request';
        aiSummary = 'Caller requested a quote or pricing information.';
      } else if (lower.includes('complaint') || lower.includes('problem') || lower.includes('issue') || lower.includes('unhappy')) {
        intent = 'complaint';
        aiSummary = 'Caller expressed dissatisfaction or reported an issue.';
      } else if (lower.includes('schedule') || lower.includes('appointment') || lower.includes('booking')) {
        intent = 'scheduling';
        aiSummary = 'Caller requested to schedule or modify an appointment.';
      } else if (lower.includes('apply') || lower.includes('job') || lower.includes('position')) {
        intent = 'job_inquiry';
        aiSummary = 'Caller inquired about employment opportunities.';
      } else if (lower.includes('supply') || lower.includes('equipment') || lower.includes('product')) {
        intent = 'vendor';
        aiSummary = 'Caller appears to be a vendor or supplier.';
      } else {
        intent = 'general_inquiry';
        aiSummary = 'General inquiry call. Manual review recommended.';
      }
    }

    await supabase.from('phone_calls').update({
      transcript: transcript ?? null,
      recording_sid: recordingSid ?? null,
      recording_url: recordingUrl ? `${recordingUrl}.mp3` : null,
      duration_seconds: duration,
      ai_summary: aiSummary,
      intent,
      status: 'completed',
      ended_at: new Date().toISOString(),
    }).eq('id', callId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Transcript handler error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
