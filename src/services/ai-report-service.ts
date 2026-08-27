import {
  buildCanonicalReportPayload,
  generateOptimizedSignatures,
  GRIMOIRE_CHAPTERS,
  readDailyOracle,
  type CanonicalReportPayload,
  type ReportProfileInput,
  type SynastryReportSummary,
} from '../domain/numerology';
import { withTimeout } from '../lib/with-timeout';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = 90_000;

export interface GrimoireChapter {
  readonly number: number;
  readonly title: string;
  readonly body: string;
}

export interface AiGrimoireResult {
  readonly payload: CanonicalReportPayload;
  readonly chapters: readonly GrimoireChapter[];
}

export function readOpenAiApiKey(): string {
  const key =
    process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() ??
    process.env.OPENAI_API_KEY?.trim() ??
    '';
  return key;
}

export function isOpenAiConfigured(): boolean {
  const key = readOpenAiApiKey();
  return key.startsWith('sk-') && key.length > 20;
}

const SYSTEM_PROMPT = [
  'Você é o Mestre Cabalista do Arcanum: voz solene, refinada e transformadora, em português do Brasil.',
  'Regra absoluta: você NUNCA inventa números. Destino, Missão, Alma, ápice, arcanos 1–99, códigos de bloqueio (111–999), Dia/Mês/Ano Pessoal e firmas já vêm calculados no JSON canônico.',
  'Cite esses números exatamente como recebidos. Não calcule, não arredonde, não substitua, não invente arcanos nem sequências.',
  'Sua tarefa é apenas a prosa interpretativa — o sentido oculto, o conselho e o selo ritual — em quatro capítulos.',
  'Responda SOMENTE com JSON válido neste formato:',
  '{"chapters":[{"number":1,"title":"...","body":"..."},{"number":2,"title":"...","body":"..."},{"number":3,"title":"...","body":"..."},{"number":4,"title":"...","body":"..."}]}',
  'Use exatamente estes títulos, nesta ordem:',
  ...GRIMOIRE_CHAPTERS.map((chapter) => `${chapter.number}. ${chapter.title}`),
  'Cada body tem 3 a 5 parágrafos, tom de grimório, sem markdown, sem listas com asterisco.',
].join('\n');

export function assembleCanonicalReport(
  profile: ReportProfileInput,
  synastrySummary?: SynastryReportSummary,
): CanonicalReportPayload {
  const signatures = generateOptimizedSignatures(profile.fullName, profile.birthDate);
  const oracle = readDailyOracle(profile.birthDate);
  if (synastrySummary === undefined) {
    return buildCanonicalReportPayload(profile, signatures, oracle);
  }
  return buildCanonicalReportPayload(profile, signatures, oracle, synastrySummary);
}

export async function generateAiGrimoire(
  profile: ReportProfileInput,
  synastrySummary?: SynastryReportSummary,
): Promise<AiGrimoireResult> {
  const payload =
    synastrySummary === undefined
      ? assembleCanonicalReport(profile)
      : assembleCanonicalReport(profile, synastrySummary);
  const chapters = await requestGrimoireChapters(payload);
  return { payload, chapters };
}

async function requestGrimoireChapters(
  payload: CanonicalReportPayload,
): Promise<GrimoireChapter[]> {
  const apiKey = readOpenAiApiKey();
  if (!isOpenAiConfigured()) {
    throw new Error(
      'A chave da OpenAI não está configurada. Defina EXPO_PUBLIC_OPENAI_API_KEY no arquivo .env.',
    );
  }

  const body = {
    model: OPENAI_MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          'Interprete o grimório a partir deste payload canônico. Os números são lei.',
          JSON.stringify(payload),
        ].join('\n'),
      },
    ],
  };

  const response = await withTimeout(
    fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }),
    OPENAI_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(messageForOpenAiStatus(response.status));
  }

  const json: unknown = await response.json();
  const content = extractAssistantContent(json);
  return parseChapters(content);
}

function messageForOpenAiStatus(status: number): string {
  if (status === 401 || status === 403) {
    return 'A chave da OpenAI foi recusada. Confira EXPO_PUBLIC_OPENAI_API_KEY.';
  }
  if (status === 429) {
    return 'O oráculo está sobrecarregado. Aguarde um momento e tente de novo.';
  }
  if (status >= 500) {
    return 'O serviço de interpretação está indisponível no momento.';
  }
  return 'Não foi possível compilar o grimório. Tente novamente.';
}

function extractAssistantContent(json: unknown): string {
  if (typeof json !== 'object' || json === null || !('choices' in json)) {
    throw new Error('A resposta da OpenAI veio incompleta.');
  }
  const choices = (json as { choices: unknown }).choices;
  if (!Array.isArray(choices) || choices[0] === undefined) {
    throw new Error('A resposta da OpenAI veio vazia.');
  }
  const first = choices[0] as { message?: { content?: unknown } };
  const content = first.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('A OpenAI não devolveu o texto dos capítulos.');
  }
  return content;
}

function parseChapters(raw: string): GrimoireChapter[] {
  const jsonText = unwrapJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    throw new Error('Não foi possível ler os capítulos do grimório.');
  }

  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && 'chapters' in parsed
      ? (parsed as { chapters: unknown }).chapters
      : null;

  if (!Array.isArray(list) || list.length !== GRIMOIRE_CHAPTERS.length) {
    throw new Error('O grimório chegou com capítulos incompletos. Tente gerar de novo.');
  }

  return GRIMOIRE_CHAPTERS.map((expected, index) => {
    const item = list[index] as { number?: unknown; title?: unknown; body?: unknown };
    const body = typeof item.body === 'string' ? item.body.trim() : '';
    if (body.length < 80) {
      throw new Error('Um dos capítulos veio vazio demais. Tente gerar de novo.');
    }
    return {
      number: expected.number,
      title: expected.title,
      body,
    };
  });
}

function unwrapJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(trimmed);
  if (fenced?.[1] !== undefined) {
    return fenced[1].trim();
  }
  return trimmed;
}
