export { getSupabase, isSupabaseConfigured } from './supabase';
export { fetchProfile, upsertProfile, updateProfilePremium, profileRowToLocal } from './profiles';
export { insertTrainedSignature } from './signatures';
export { signOutCurrentUser } from './session';
export {
  assembleCanonicalReport,
  generateAiGrimoire,
  isOpenAiConfigured,
} from './ai-report-service';
export type {
  AiGrimoireResult,
  GenerateAiGrimoireOptions,
  GrimoireChapter,
} from './ai-report-service';
export type {
  Database,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  SignatureRow,
  SignatureInsert,
  SignatureUpdate,
} from './database.types';
