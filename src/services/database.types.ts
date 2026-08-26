export interface ProfileRow {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  destino: number | null;
  expressao: number | null;
  is_premium: boolean;
  data_criacao: string;
}

export interface ProfileInsert {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  destino?: number | null;
  expressao?: number | null;
  is_premium?: boolean;
  data_criacao?: string;
}

export interface ProfileUpdate {
  nome_completo?: string;
  data_nascimento?: string;
  destino?: number | null;
  expressao?: number | null;
  is_premium?: boolean;
}

export interface SignatureRow {
  id: string;
  user_id: string;
  texto_assinatura: string;
  possui_bloqueio: boolean;
  status_treino: boolean;
  data_criacao: string;
}

export interface SignatureInsert {
  id?: string;
  user_id: string;
  texto_assinatura: string;
  possui_bloqueio?: boolean;
  status_treino?: boolean;
  data_criacao?: string;
}

export interface SignatureUpdate {
  texto_assinatura?: string;
  possui_bloqueio?: boolean;
  status_treino?: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      signatures: {
        Row: SignatureRow;
        Insert: SignatureInsert;
        Update: SignatureUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
