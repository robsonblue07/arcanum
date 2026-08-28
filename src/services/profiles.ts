import { getSupabase } from './supabase';
import type { ProfileInsert, ProfileRow } from './database.types';
import type { UserProfile } from '../store/profile-store';

export function profileRowToLocal(row: ProfileRow): UserProfile {
  return {
    fullName: row.nome_completo,
    birthDate: row.data_nascimento,
    isPremium: row.is_premium === true,
  };
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProfileRow | null;
}

export async function upsertProfile(input: ProfileInsert): Promise<ProfileRow> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .upsert(input, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}
