export { getSupabase, isSupabaseConfigured } from './supabase';
export { fetchProfile, upsertProfile, updateProfilePremium, profileRowToLocal } from './profiles';
export { insertTrainedSignature } from './signatures';
export { signOutCurrentUser } from './session';
export type {
  Database,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  SignatureRow,
  SignatureInsert,
  SignatureUpdate,
} from './database.types';
