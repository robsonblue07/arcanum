import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { CanonicalReportPayload } from '../domain/numerology';
import type { GrimoireChapter } from '../services/ai-report-service';

const GOLD = '#D4AF37';
const GOLD_SOFT = '#F0D78C';
const VOID = '#07040F';
const IVORY = '#F6F0E6';
const MIST = '#B8A8D4';

export interface GrimoirePdfResult {
  readonly uri: string | null;
  readonly usedPrintDialog: boolean;
}

export function renderGrimoireHtml(
  payload: CanonicalReportPayload,
  chapters: readonly GrimoireChapter[],
): string {
  const chapterHtml = chapters
    .map(
      (chapter) => `
        <section class="chapter">
          <p class="kicker">Capítulo ${chapter.number}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          ${paragraphsToHtml(chapter.body)}
        </section>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Grimório Cabalístico — ${escapeHtml(payload.person.fullName)}</title>
    <style>
      @page { margin: 22mm 16mm 28mm; }
      * { box-sizing: border-box; }
      body {
        background: ${VOID};
        color: ${IVORY};
        font-family: Georgia, "Palatino Linotype", Palatino, "Times New Roman", serif;
        margin: 0;
        padding: 12mm 8mm 16mm;
      }
      header.mast {
        border-bottom: 1px solid ${GOLD};
        margin-bottom: 18px;
        padding-bottom: 12px;
      }
      .brand {
        color: ${GOLD};
        font-size: 11px;
        letter-spacing: 0.42em;
        margin: 0 0 8px;
        text-transform: uppercase;
      }
      h1 {
        color: ${GOLD_SOFT};
        font-size: 28px;
        font-weight: 600;
        line-height: 1.2;
        margin: 0 0 8px;
      }
      .meta { color: ${MIST}; font-size: 13px; margin: 0; }
      .seals {
        display: flex;
        gap: 18px;
        margin: 22px 0 8px;
      }
      .seal {
        border: 1px solid ${GOLD};
        border-radius: 999px;
        min-width: 88px;
        padding: 12px 10px;
        text-align: center;
      }
      .seal b {
        color: ${GOLD_SOFT};
        display: block;
        font-size: 26px;
      }
      .seal span {
        color: ${GOLD};
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .canon {
        color: ${MIST};
        font-size: 12px;
        line-height: 1.55;
        margin: 16px 0 28px;
      }
      .kicker {
        color: ${GOLD};
        font-size: 10px;
        letter-spacing: 0.28em;
        margin: 0 0 6px;
        text-transform: uppercase;
      }
      h2 {
        color: ${GOLD_SOFT};
        font-size: 20px;
        margin: 0 0 12px;
      }
      .chapter { margin: 0 0 28px; page-break-inside: avoid; }
      p {
        color: ${IVORY};
        font-size: 13.5px;
        line-height: 1.7;
        margin: 0 0 12px;
        text-align: justify;
      }
      footer.mast {
        border-top: 1px solid ${GOLD};
        color: ${GOLD};
        font-size: 10px;
        letter-spacing: 0.12em;
        margin-top: 28px;
        padding-top: 10px;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <header class="mast">
      <p class="brand">Arcanum · Grimório Cabalístico</p>
      <h1>${escapeHtml(payload.person.fullName)}</h1>
      <p class="meta">Nascimento ${escapeHtml(payload.person.birthDate)} · Documento gerado pelos motores oficiais</p>
    </header>
    <div class="seals">
      ${sealHtml('Destino', payload.triad.destiny)}
      ${sealHtml('Missão', payload.triad.mission)}
      ${sealHtml('Ápice', payload.triad.apex)}
    </div>
    <p class="canon">
      Firma atual: ${escapeHtml(payload.originalSignature.signature)}
      (bloqueios ${escapeHtml(payload.pyramid.blockageCodes.join(', ') || 'nenhum')}).
      Firma retificada: ${escapeHtml(payload.rectifiedSignature.signature)},
      ápice ${payload.rectifiedSignature.apex}.
      Dia Pessoal ${payload.oracle.personalDay} — ${escapeHtml(payload.oracle.title)}.
    </p>
    ${chapterHtml}
    <footer class="mast">
      Arcanum · os números deste grimório não foram inventados pela IA · selo oficial
    </footer>
  </body>
</html>`;
}

function sealHtml(caption: string, value: number): string {
  return `<div class="seal"><b>${value}</b><span>${caption}</span></div>`;
}

function paragraphsToHtml(body: string): string {
  const parts = body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const blocks = parts.length > 0 ? parts : [body.trim()];
  return blocks.map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br />')}</p>`).join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function generateGrimoirePdf(
  payload: CanonicalReportPayload,
  chapters: readonly GrimoireChapter[],
): Promise<GrimoirePdfResult> {
  const html = renderGrimoireHtml(payload, chapters);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return { uri: null, usedPrintDialog: true };
  }

  const printed = await Print.printToFileAsync({ html });
  return { uri: printed.uri, usedPrintDialog: false };
}

export async function shareGrimoirePdf(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento nativo não está disponível neste aparelho.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Compartilhar Grimório Cabalístico',
  });
}
