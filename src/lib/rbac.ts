import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a supabase client for auth verification (requires access token)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const getAuthClient = (req: NextRequest | Request) => {
  const authHeader = req.headers.get('authorization');
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader || '' } }
  });
};

/**
 * Validates that the request is coming from an authenticated user
 * and that the user possesses one of the required roles.
 */
export async function verifyRole(req: NextRequest | Request, allowedRoles: string[]) {
  const supabase = getAuthClient(req);
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized: No active session found.' };
  }

  // Check role in user_metadata first
  let role = user.user_metadata?.role;

  // Fallback to querying the public.users table if not in metadata
  if (!role) {
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (dbError || !userData) {
      return { authorized: false, error: 'Unauthorized: User role not found.' };
    }
    role = userData.role;
  }

  if (!allowedRoles.includes(role)) {
    return { 
      authorized: false, 
      error: `Forbidden: User role '${role}' does not have permission for this action.` 
    };
  }

  return { authorized: true, user, role };
}

/**
 * Validates Twilio Webhook Signatures
 */
export function verifyTwilioSignature(req: NextRequest, params: Record<string, any>) {
  const twilioSignature = req.headers.get('x-twilio-signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    console.warn('⚠️ TWILIO_AUTH_TOKEN is not set. Skipping signature validation. THIS IS INSECURE FOR PRODUCTION.');
    return true; 
  }

  if (!twilioSignature) return false;

  // Ideally, use twilio.validateRequest, but if twilio is missing or fails:
  try {
    const twilio = require('twilio');
    const url = req.url; // Note: In production behind proxies, this must be the exact public URL Twilio requested
    return twilio.validateRequest(authToken, twilioSignature, url, params);
  } catch (err) {
    console.error('Twilio validation error:', err);
    return false;
  }
}
