import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is missing');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to set current member context for RLS
export const setCurrentMember = async (memberId: string) => {
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_member_id',
      setting_value: memberId,
      is_local: true
    });
    
    if (error) {
      console.error('Error setting current member:', error);
    }
  } catch (error) {
    console.error('Error in setCurrentMember:', error);
  }
};