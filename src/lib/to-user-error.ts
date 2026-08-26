const NETWORK_PATTERN =
  /network request failed|failed to fetch|fetch failed|networkerror|sem conex|offline|internet/i;
const TIMEOUT_PATTERN = /timeout|timed out|demorou/i;

export function toUserError(error: unknown): string {
  const raw = extractMessage(error);
  const name = error instanceof Error ? error.name : '';

  if (name === 'TimeoutError' || TIMEOUT_PATTERN.test(raw)) {
    return 'A conexão demorou demais. Verifique a internet e tente novamente.';
  }
  if (
    name === 'AuthRetryableFetchError' ||
    NETWORK_PATTERN.test(raw) ||
    isNetworkLike(error)
  ) {
    return 'Sem conexão com a internet. Verifique a rede e tente novamente.';
  }

  const normalized = raw.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials') ||
    normalized.includes('invalid email or password')
  ) {
    return 'E-mail ou senha incorretos.';
  }
  if (normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (
    normalized.includes('user already registered') ||
    normalized.includes('already registered') ||
    normalized.includes('already been registered')
  ) {
    return 'Este e-mail já possui uma conta. Entre ou recupere o acesso.';
  }
  if (normalized.includes('invalid email') || normalized.includes('unable to validate email')) {
    return 'Informe um e-mail válido.';
  }
  if (normalized.includes('password') && normalized.includes('at least')) {
    return 'A senha deve ter ao menos 6 caracteres.';
  }
  if (normalized.includes('rate limit') || normalized.includes('over_email_send_rate_limit')) {
    return 'Aguarde um momento antes de tentar de novo.';
  }
  if (normalized.includes('not configured') || normalized.includes('não configurado')) {
    return 'O Arcanum ainda não está conectado à nuvem. Confira as chaves no arquivo .env.';
  }

  if (raw.length > 0 && raw.length < 140 && !looksLikeTechnicalDump(raw)) {
    return raw;
  }

  return 'Não foi possível concluir. Tente novamente.';
}

function extractMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return '';
}

function isNetworkLike(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = (error as { name: unknown }).name;
    if (name === 'TypeError' || name === 'AuthRetryableFetchError') {
      const message = extractMessage(error);
      return message.length === 0 || NETWORK_PATTERN.test(message);
    }
  }
  return false;
}

function looksLikeTechnicalDump(value: string): boolean {
  return /[{}]|error code|stack|exception|sql|uuid|jwt/i.test(value);
}
