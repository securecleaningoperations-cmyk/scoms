/**
 * Twilio Transcript Callback
 * POST /api/twilio/transcript
 * 
 * Receives transcription from Twilio, updates call record,
 * and triggers AI summary generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyTwilioSignature } from '@/lib/rbac';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    // Basic signature verification
    const isValid = verifyTwilioSignature(request, {});
    if (!isValid) {
      console.error('Invalid Twilio signature in transcript callback');
      return NextResponse.json({ ok: false, error: 'Unauthorized signature' }, { status: 403 });
    }

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
      const { jevJudgePhoneCall } = await import('@/lib/typesafe');
      const jevResult = await jevJudgePhoneCall({
        transcript,
      });

      intent = jevResult.departmentRoute;
      aiSummary = `${jevResult.urgencyLabel} (${jevResult.callerType.replace(/_/g, ' ')}): ${jevResult.recommendedAction}`;
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
