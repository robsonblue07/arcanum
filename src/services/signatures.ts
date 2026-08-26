import type { SignatureInsert, SignatureRow } from './database.types';
import { getSupabase } from './supabase';

export async function insertTrainedSignature(input: {
  userId: string;
  textoAssinatura: string;
}): Promise<SignatureRow> {
  const payload: SignatureInsert = {
    user_id: input.userId,
    texto_assinatura: input.textoAssinatura.trim(),
    possui_bloqueio: false,
    status_treino: true,
  };

  const { data, error } = await getSupabase()
    .from('signatures')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as SignatureRow;
}
