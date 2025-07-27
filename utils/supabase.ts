import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Environment Check:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

// Declare variables at top level
let supabase: any;
let setCurrentMember: (memberId: string) => Promise<void>;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('Supabase environment variables not configured properly');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  
  // Create a mock client to prevent crashes
  supabase = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) })
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  };
  
  setCurrentMember = async (memberId: string) => {
    console.log('Mock setCurrentMember called with:', memberId);
  };
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  
  // Helper function to set current member context for RLS
  setCurrentMember = async (memberId: string) => {
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
}

export { supabase, setCurrentMember };