import { supabase } from '@/lib/supabase';

export async function fetchSettings() {
  const [{ data: system }, { data: operational }, { data: notification }] = await Promise.all([
    supabase.from('system_settings').select('*'),
    supabase.from('operational_settings').select('*'),
    supabase.from('notification_settings').select('*')
  ]);

  return {
    system: system || [],
    operational: operational || [],
    notification: notification || []
  };
}

export async function updateSetting(table: 'system_settings' | 'operational_settings' | 'notification_settings', key: string, value: any, description: string) {
  // First try to check if it exists
  const { data: existing } = await supabase.from(table).select('id').eq('setting_key', key).single();
  
  let result;
  
  if (existing) {
    result = await supabase.from(table).update({ setting_value: value, updated_at: new Date() }).eq('setting_key', key);
  } else {
    result = await supabase.from(table).insert([{ setting_key: key, setting_value: value, description }]);
  }

  if (result.error) throw result.error;
  
  // Create audit log
  await supabase.from('audit_logs').insert([{
    action: 'update_setting',
    entity_type: table,
    entity_id: key,
    new_values: { value }
  }]);
}
