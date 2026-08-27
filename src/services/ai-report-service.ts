import {
  buildCanonicalReportPayload,
  generateOptimizedSignatures,
  GRIMOIRE_CHAPTERS,
  readDailyOracle,
  type CanonicalReportPayload,
  type ReportProfileInput,
  type SynastryReportSummary,
} from '../domain/numerology';
import i18n, { getActiveLanguage, isAppLanguage, type AppLanguage } from '../lib/i18n';
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

export interface GenerateAiGrimoireOptions {
  readonly synastrySummary?: SynastryReportSummary;
  readonly language?: AppLanguage;
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
  options: GenerateAiGrimoireOptions = {},
): Promise<AiGrimoireResult> {
  const language =
    options.language !== undefined && isAppLanguage(options.language)
      ? options.language
      : getActiveLanguage();
  const payload =
    options.synastrySummary === undefined
      ? assembleCanonicalReport(profile)
      : assembleCanonicalReport(profile, options.synastrySummary);
  const chapters = await requestGrimoireChapters(payload, language);
  return { payload, chapters };
}

function tLang(language: AppLanguage, key: string, vars?: Record<string, string | number>): string {
  const translate = i18n.getFixedT(language);
  if (vars === undefined) {
    return String(translate(key));
  }
  return String(translate(key, vars));
}

function chapterTitles(language: AppLanguage): readonly string[] {
  return [
    tLang(language, 'grimoire.chapters.1'),
    tLang(language, 'grimoire.chapters.2'),
    tLang(language, 'grimoire.chapters.3'),
    tLang(language, 'grimoire.chapters.4'),
  ];
}

function buildSystemPrompt(language: AppLanguage): string {
  const titles = chapterTitles(language);
  return [
    tLang(language, 'grimoire.systemRole'),
    tLang(language, 'grimoire.systemRuleNumbers'),
    tLang(language, 'grimoire.systemRuleCite'),
    tLang(language, 'grimoire.systemTask'),
    tLang(language, 'grimoire.systemJsonFormat'),
    tLang(language, 'grimoire.systemJsonShape'),
    tLang(language, 'grimoire.systemUseTitles'),
    ...titles.map((title, index) => `${index + 1}. ${title}`),
    tLang(language, 'grimoire.systemBodyStyle'),
  ].join('\n');
}

async function requestGrimoireChapters(
  payload: CanonicalReportPayload,
  language: AppLanguage,
): Promise<GrimoireChapter[]> {
  const apiKey = readOpenAiApiKey();
  if (!isOpenAiConfigured()) {
    throw new Error(tLang(language, 'grimoire.errors.missingKey'));
  }

  const body = {
    model: OPENAI_MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(language) },
      {
        role: 'user',
        content: [tLang(language, 'grimoire.userPreamble'), JSON.stringify(payload)].join('\n'),
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
    throw new Error(messageForOpenAiStatus(response.status, language));
  }

  const json: unknown = await response.json();
  const content = extractAssistantContent(json, language);
  return parseChapters(content, language);
}

function messageForOpenAiStatus(status: number, language: AppLanguage): string {
  if (status === 401 || status === 403) {
    return tLang(language, 'grimoire.errors.rejectedKey');
  }
  if (status === 429) {
    return tLang(language, 'grimoire.errors.overloaded');
  }
  if (status >= 500) {
    return tLang(language, 'grimoire.errors.unavailable');
  }
  return tLang(language, 'grimoire.errors.compileFail');
}

function extractAssistantContent(json: unknown, language: AppLanguage): string {
  if (typeof json !== 'object' || json === null || !('choices' in json)) {
    throw new Error(tLang(language, 'grimoire.errors.incomplete'));
  }
  const choices = (json as { choices: unknown }).choices;
  if (!Array.isArray(choices) || choices[0] === undefined) {
    throw new Error(tLang(language, 'grimoire.errors.empty'));
  }
  const first = choices[0] as { message?: { content?: unknown } };
  const content = first.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error(tLang(language, 'grimoire.errors.noText'));
  }
  return content;
}

function parseChapters(raw: string, language: AppLanguage): GrimoireChapter[] {
  const jsonText = unwrapJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    throw new Error(tLang(language, 'grimoire.errors.parseFail'));
  }

  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && 'chapters' in parsed
      ? (parsed as { chapters: unknown }).chapters
      : null;

  if (!Array.isArray(list) || list.length !== GRIMOIRE_CHAPTERS.length) {
    throw new Error(tLang(language, 'grimoire.errors.incompleteChapters'));
  }

  const titles = chapterTitles(language);
  return GRIMOIRE_CHAPTERS.map((expected, index) => {
    const item = list[index] as { number?: unknown; title?: unknown; body?: unknown };
    const body = typeof item.body === 'string' ? item.body.trim() : '';
    if (body.length < 80) {
      throw new Error(tLang(language, 'grimoire.errors.shortChapter'));
    }
    return {
      number: expected.number,
      title: titles[index] ?? expected.title,
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
