import { useMemo } from 'react';
import { getSupabase } from '../lib/supabase';

export function useSupabase() {
  return useMemo(() => getSupabase(), []);
}