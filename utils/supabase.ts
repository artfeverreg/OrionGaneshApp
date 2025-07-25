import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to set current member context for RLS
export const setCurrentMember = async (memberId: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_member_id',
    setting_value: memberId,
    is_local: true
  });
};