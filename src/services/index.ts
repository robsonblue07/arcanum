export { getSupabase, isSupabaseConfigured } from './supabase';
export { fetchProfile, upsertProfile, profileRowToLocal } from './profiles';
export { startStripeCheckout, refreshPremiumFromServer, waitForPremiumUnlock, handleCheckoutReturnUrl } from './checkout';
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
  StripeEventRow,
  StripeEventInsert,
  SignatureRow,
  SignatureInsert,
  SignatureUpdate,
} from './database.types';
